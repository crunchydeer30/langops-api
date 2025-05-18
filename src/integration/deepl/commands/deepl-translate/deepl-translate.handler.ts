import { CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Translator } from 'deepl-node';
import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { BaseTranslateHandler } from 'src/internal/machine-translation/application/commands/base-translate/base-translate.handler';
import { DeeplTranslateCommand } from './deepl-translate.command';
import { Env } from '@common/config';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { TranslationTaskSegment } from 'src/internal/translation-task-processing/domain/entities/translation-task-segment.entity';

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
    protected readonly translationTaskSegmentRepository: TranslationTaskSegmentRepository,
    private readonly configService: ConfigService<Env>,
  ) {
    super(translationTaskRepository, translationTaskSegmentRepository);
    this.apiKey = this.configService.getOrThrow('DEEPL_API_KEY');
    this.translator = new Translator(this.apiKey);
  }

  async translate(
    task: TranslationTask,
    segments: TranslationTaskSegment[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Translating ${segments.length} segments for task ${task.id}`,
      );

      const preparedSegments = this.parseSegments(segments);
      if (preparedSegments.length === 0) {
        this.logger.warn(`No segments to translate for task ${task.id}`);
        return;
      }

      this.logger.debug(
        `Prepared segments examples: ${JSON.stringify(
          preparedSegments.slice(0, 2).map((s) => ({
            id: s.id,
            originalText:
              s.originalText.substring(0, 30) +
              (s.originalText.length > 30 ? '...' : ''),
            preparedText:
              s.preparedText.substring(0, 30) +
              (s.preparedText.length > 30 ? '...' : ''),
          })),
        )}`,
      );

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
          'en',
          'ru',
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
      console.log(translationResults);
    } catch (error) {
      this.logger.error(
        `DeepL translation error for task ${task.id}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private parseSegments(segments: TranslationTaskSegment[]): PreparedSegment[] {
    this.logger.debug(
      `Parsing ${segments.length} segments for DeepL translation`,
    );

    return segments.map((segment) => {
      const tokenMap: Record<string, string> = {};

      const preparedText = segment.sourceContent.replace(
        /\[\[TKN::([A-Z0-9-]+)\]\]/g,
        (match, tokenId) => {
          const placeholder = `<x id="${tokenId}"></x>`;
          tokenMap[placeholder] = match;
          return placeholder;
        },
      );

      return {
        id: segment.id,
        originalText: segment.sourceContent,
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
