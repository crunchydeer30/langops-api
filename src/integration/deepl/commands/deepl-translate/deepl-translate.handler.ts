import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Translator } from 'deepl-node';
import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { BaseTranslateHandler } from 'src/internal/machine-translation/application/commands/base-translate/base-translate.handler';
import { DeeplTranslateCommand } from './deepl-translate.command';
import { Env } from '@common/config';
import {
  IBaseTranslationResult,
  TranslationSegment,
} from 'src/internal/machine-translation/application/commands/base-translate/base-translate.command';

interface PreparedSegment {
  id: string;
  originalText: string;
  preparedText: string;
  tokenMap: Record<string, string>;
}

@Injectable()
@CommandHandler(DeeplTranslateCommand)
export class DeeplTranslateHandler extends BaseTranslateHandler {
  protected readonly logger = new Logger(DeeplTranslateHandler.name);
  private readonly apiKey: string;
  private readonly translator: Translator;

  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly commandBus: CommandBus,
    private readonly configService: ConfigService<Env>,
  ) {
    super(translationTaskRepository, commandBus);
    this.apiKey = this.configService.getOrThrow('DEEPL_API_KEY');
    this.translator = new Translator(this.apiKey);
  }

  async translate(
    segments: TranslationSegment[],
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<IBaseTranslationResult> {
    try {
      this.logger.log(`Translating ${segments.length} segments`);

      const preparedSegments = this.parseSegments(segments);
      if (preparedSegments.length === 0) {
        this.logger.warn(`No segments to translate`);
        return { results: [] };
      }

      const batchSize = 25;
      const translationResults: {
        segmentId: string;
        translatedText: string;
      }[] = [];

      for (let i = 0; i < preparedSegments.length; i += batchSize) {
        const batch = preparedSegments.slice(i, i + batchSize);
        const textsToTranslate = batch.map((segment) => segment.preparedText);

        this.logger.debug(
          `Translating batch ${Math.floor(i / batchSize) + 1} with ${textsToTranslate.length} segments`,
        );

        const translationResponse = await this.translator.translateText(
          textsToTranslate,
          sourceLanguage as any,
          targetLanguage as any,
          {
            tagHandling: 'xml',
            ignoreTags: ['x'],
            preserveFormatting: true,
          },
        );

        const translations = Array.isArray(translationResponse)
          ? translationResponse
          : [translationResponse];

        batch.forEach((segment, index) => {
          const translation = translations[index];
          if (!translation) {
            this.logger.warn(
              `No translation returned for segment ${segment.id}`,
            );
            return;
          }

          const translatedText = this.restoreTokens(
            translation.text,
            segment.tokenMap,
          );

          translationResults.push({
            segmentId: segment.id,
            translatedText,
          });
        });
      }

      this.logger.debug(
        `Successfully translated ${translationResults.length} segments`,
      );

      return { results: translationResults };
    } catch (error) {
      this.logger.error(
        `DeepL translation error: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private parseSegments(segments: TranslationSegment[]): PreparedSegment[] {
    this.logger.debug(
      `Parsing ${segments.length} segments for DeepL translation`,
    );

    return segments.map((segment) => {
      const tokenMap: Record<string, string> = {};

      // Use the content from the segment
      const contentToTranslate = segment.content;

      this.logger.debug(`Preparing segment ${segment.id} for translation`);

      const preparedText = contentToTranslate.replace(
        /\[\[TKN::([A-Z0-9-]+)\]\]/g,
        (match, tokenId) => {
          const placeholder = `<x id="${tokenId}"></x>`;
          tokenMap[placeholder] = match;
          return placeholder;
        },
      );

      return {
        id: segment.id,
        originalText: contentToTranslate,
        preparedText,
        tokenMap,
      };
    });
  }

  private restoreTokens(
    translatedText: string,
    tokenMap: Record<string, string>,
  ): string {
    let result = translatedText;

    Object.entries(tokenMap).forEach(([placeholder, originalToken]) => {
      result = result.replace(placeholder, originalToken);
    });

    result = result.replace(/<x id="([A-Z0-9-]+)"\s*><\/x>/g, (_, tokenId) => {
      return `[[TKN::${tokenId}]]`;
    });

    return result;
  }
}
