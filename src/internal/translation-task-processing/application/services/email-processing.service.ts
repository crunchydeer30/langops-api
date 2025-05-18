import { Injectable, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { TranslationTaskRepository } from '../../../translation-task/infrastructure/repositories/translation-task.repository';
import { TaskSegmentsCreatedEvent } from '../../../translation-task/domain/events/task-segments-created.event';
import { TranslationTaskSegment } from '../../domain/entities/translation-task-segment.entity';
import { TranslationTaskSegmentRepository } from '../../infrastructure/repositories/translation-task-segment.repository';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import {
  TranslationSpecialTokenType,
  TranslationSpecialTokenMap,
  TranslationSpecialToken,
  UrlSpecialToken,
  ImageSpecialToken,
} from '../../domain/interfaces/translation-segment-token-map.interface';

@Injectable()
export class EmailProcessingService {
  private readonly logger = new Logger(EmailProcessingService.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly segmentRepository: TranslationTaskSegmentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async parseEmailTask(taskId: string): Promise<{
    wordCount: number;
    segmentCount: number;
    templatedContent: string;
  }> {
    this.logger.debug(`Parsing email task ${taskId}`);

    const task = await this.translationTaskRepository.findById(taskId);
    if (!task) {
      this.logger.error(`Task ${taskId} not found for parsing`);
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    // Parse email content
    const sourceContent = task.sourceContent;
    this.logger.debug(
      `Parsing content for task ${taskId} (length: ${sourceContent.length})`,
    );

    const result = this.parseEmail(sourceContent);
    const templatedContent = result.task.templatedData;

    const domainSegments = await this.persistSegments(taskId, result.segments);
    const segmentCount = domainSegments.length;

    const wordCount = domainSegments.reduce((total, segment) => {
      const words = segment.sourceContent.split(/\s+/).filter(Boolean).length;
      return total + words;
    }, 0);

    this.logger.debug(
      `Email parsing complete for task ${taskId}: ${segmentCount} segments, ${wordCount} words`,
    );

    // Emit domain event about segments creation
    this.eventBus.publish(
      new TaskSegmentsCreatedEvent(taskId, segmentCount, wordCount),
    );

    return { wordCount, segmentCount, templatedContent };
  }

  private async persistSegments(
    taskId: string,
    segments: TranslationTaskSegment[],
  ): Promise<TranslationTaskSegment[]> {
    const domainSegments = segments.map((segment, index) => {
      return TranslationTaskSegment.create({
        id: segment.id,
        translationTaskId: taskId,
        segmentOrder: index,
        sourceContent: segment.sourceContent,
        specialTokensMap: segment.specialTokensMap,
        metadata: {
          originalIndex: index,
          createdFromParser: true,
          parseTimestamp: new Date().toISOString(),
        },
      });
    });

    await this.segmentRepository.saveMany(domainSegments);

    return domainSegments;
  }

  public reconstructEmail(
    templatedData: string,
    segments: TranslationTaskSegment[],
    useEditedContent = true,
  ): string {
    let result = templatedData;
    segments.forEach((segment) => {
      const segmentContent =
        (useEditedContent && segment.editedContent) ||
        segment.machineTranslatedContent ||
        segment.sourceContent;
      result = result.replace(
        new RegExp(`\\[\\[TKN::${segment.id}\\]\\]`, 'g'),
        segmentContent,
      );
    });
    segments.forEach((segment) => {
      const { specialTokensMap } = segment;
      if (!specialTokensMap) return;
      Object.entries(specialTokensMap).forEach(([tokenId, tokenData]) => {
        result = result.replace(
          new RegExp(`\\[\\[TKN::${tokenId}\\]\\]`, 'g'),
          tokenData.sourceContent,
        );
      });
    });
    return result;
  }

  private parseEmail(email: string) {
    const taskId = uuidv4();
    const tokenCounters: Record<string, number> = {};
    const $ = cheerio.load(email);
    const segments: TranslationTaskSegment[] = [];

    const blockSelector = `
      p, h1, h2, h3, h4, h5, h6, li, blockquote,
      div:not(:has(p, div, h1, h2, h3, h4, h5, h6, li, blockquote, table)),
      td:not(:has(p, div, h1, h2, h3, h4, h5, h6, li, blockquote))
    `;

    const findLeafBlocks = (rootElem: cheerio.Cheerio<any>) => {
      const blocks = rootElem.find(blockSelector);

      if (blocks.length === 0) {
        const text = rootElem.text().trim();
        if (text) {
          const tagName = rootElem.prop('tagName')?.toLowerCase() || '';
          const isStructural = [
            'table',
            'tbody',
            'thead',
            'tfoot',
            'tr',
          ].includes(tagName);

          if (!isStructural) {
            this.logger.debug(`Processing leaf node with tag ${tagName}`);
            processBlockElement(rootElem, segments.length);
          }
        }
        return;
      }

      blocks.each((_, elem) => {
        const blockElem = $(elem);
        const tagName = blockElem.prop('tagName')?.toLowerCase() || '';

        if (['table', 'tbody', 'thead', 'tfoot', 'tr'].includes(tagName)) {
          return;
        }

        if (blockElem.find(blockSelector).length === 0) {
          if (blockElem.text().trim()) {
            processBlockElement(blockElem, segments.length);
          }
        }
      });
    };

    const processBlockElement = (
      blockElem: cheerio.Cheerio<any>,
      index: number,
    ) => {
      const blockHtml = $.html(blockElem);
      const $$ = cheerio.load(blockHtml);
      const specialTokensMap: TranslationSpecialTokenMap = {};

      $$('b, strong, i, em, a, img, span, u, code, sup, sub, font').each(
        (_, el) => {
          const tagName = el.tagName.toLowerCase();
          const attrs = el.attribs;

          let tokenType: TranslationSpecialTokenType;
          if (tagName === 'a') {
            tokenType = TranslationSpecialTokenType.URL;
          } else if (tagName === 'img') {
            tokenType = TranslationSpecialTokenType.IMAGE;
          } else {
            tokenType = TranslationSpecialTokenType.INLINE_FORMATTING;
          }

          tokenCounters[tokenType] = (tokenCounters[tokenType] || 0) + 1;
          const tokenId = `${tokenType}-${tokenCounters[tokenType]}`;

          const originalHtml = $$.html(el);
          const innerHtml = $$(el).text();

          const tokenData: TranslationSpecialToken = {
            id: tokenId,
            sourceContent: originalHtml,
            type: tokenType,
            attrs,
            innerHtml,
          } as TranslationSpecialToken;

          if (tokenType === TranslationSpecialTokenType.URL) {
            const urlToken = tokenData as UrlSpecialToken;
            urlToken.href = attrs.href;
            urlToken.displayText = $$(el).text();
          } else if (tokenType === TranslationSpecialTokenType.IMAGE) {
            const imageToken = tokenData as ImageSpecialToken;
            imageToken.src = attrs.src;
            imageToken.alt = attrs.alt;
          }

          specialTokensMap[tokenId] = tokenData;
          $$(el).replaceWith(`[[TKN::${tokenId}]]`);
        },
      );

      const plainText = $$.root().text();
      const segment = TranslationTaskSegment.create({
        translationTaskId: taskId,
        segmentOrder: index,
        sourceContent: plainText,
        specialTokensMap,
      });
      segments.push(segment);
    };

    findLeafBlocks($.root());

    const template$ = cheerio.load(email);
    segments.forEach((segment) => {
      let found = false;

      template$(blockSelector).each((_, el) => {
        if (found) return;

        const elemText = template$(el).text().trim();
        const sourceText = segment.sourceContent.trim();

        const exactMatch = elemText === sourceText;

        if (exactMatch && template$(el).find(blockSelector).length === 0) {
          template$(el).html(`[[TKN::${segment.id}]]`);
          found = true;
          return false;
        }
      });

      if (!found) {
        template$(blockSelector).each((_, el) => {
          if (found) return;

          const elemText = template$(el).text().trim();
          const sourceText = segment.sourceContent.trim();

          if (
            template$(el).find(blockSelector).length === 0 &&
            !template$(el).html()?.includes('[[TKN::')
          ) {
            if (
              elemText.length > 20 &&
              (elemText.includes(sourceText) || sourceText.includes(elemText))
            ) {
              template$(el).html(`[[TKN::${segment.id}]]`);
              found = true;
              return false;
            }
          }
        });
      }
    });

    const taskResult = {
      id: taskId,
      originalData: email,
      templatedData: template$.html(),
    };
    const reconstructedData = this.reconstructEmail(
      taskResult.templatedData,
      segments,
      false,
    );

    return {
      task: { ...taskResult, reconstructedData },
      segments,
    };
  }
}
