import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { TranslationTaskSegment } from '../../domain/entities/translation-task-segment.entity';
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
  reconstructEmail(
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

      result = result.replace(`{${segment.id}}`, `(!) ${segmentContent}`);
    });

    segments.forEach((segment) => {
      const { specialTokensMap } = segment;
      if (!specialTokensMap) return;

      Object.entries(specialTokensMap).forEach(([tokenId, tokenData]) => {
        const replacement = tokenData.sourceContent;

        result = result.replace(
          new RegExp(`\\{${tokenId}\\}`, 'g'),
          replacement,
        );
      });
    });

    return result;
  }
  parseEmail(email: string) {
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
          };

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
          $$(el).replaceWith(`{${tokenId}}`);
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
          template$(el).html(`{${segment.id}}`);
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
            !template$(el).html()?.includes('{')
          ) {
            if (
              elemText.length > 20 &&
              (elemText.includes(sourceText) || sourceText.includes(elemText))
            ) {
              template$(el).html(`{${segment.id}}`);
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
      task: {
        ...taskResult,
        reconstructedData,
      },
      segments,
    };
  }
}
