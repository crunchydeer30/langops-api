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
export class EmailParsingService {
  private readonly logger = new Logger(EmailParsingService.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly segmentRepository: TranslationTaskSegmentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async parseEmailTask(taskId: string): Promise<void> {
    this.logger.log(`Starting parsing of email task ${taskId}`);

    const task = await this.translationTaskRepository.findById(taskId);
    if (!task) {
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    try {
      const existingSegments =
        await this.segmentRepository.findByTranslationTaskId(taskId);
      if (existingSegments.length > 0) {
        this.logger.log(
          `Found ${existingSegments.length} existing segments for task ${taskId}, cleaning up before re-parsing`,
        );
      }

      const sourceContent = task.sourceContent;
      const result = this.parseEmail(sourceContent);

      task.templatedContent = result.task.templatedData;

      const domainSegments = await this.persistSegments(
        taskId,
        result.segments,
      );

      task.markAsParsed(domainSegments.length);

      await this.translationTaskRepository.save(task);

      this.eventBus.publish(
        new TaskSegmentsCreatedEvent(taskId, domainSegments.length),
      );

      this.logger.log(
        `Successfully parsed email task ${taskId} into ${domainSegments.length} segments`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to parse email task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      task.markAsParsingError(
        error instanceof Error ? error.message : String(error),
      );
      await this.translationTaskRepository.save(task);

      throw error;
    }
  }

  private async persistSegments(
    taskId: string,
    segments: TranslationTaskSegment[],
  ): Promise<TranslationTaskSegment[]> {
    this.logger.log(
      `Persisting ${segments.length} segments for task ${taskId}`,
    );

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
    this.logger.log(
      `Successfully persisted ${domainSegments.length} segments for task ${taskId}`,
    );

    return domainSegments;
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
        this.logger.debug(
          `No exact match found for segment: ${segment.sourceContent.substring(0, 30)}...`,
        );

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

    return {
      task: taskResult,
      segments,
    };
  }
}
