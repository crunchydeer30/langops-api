import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { SourceLanguageCode, TargetLanguageCode, Translator } from 'deepl-node';
import { Injectable, Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { BaseTranslateHandler } from 'src/internal/machine-translation/application/commands/base-translate/base-translate.handler';
import { DeeplTranslateCommand } from './deepl-translate.command';
import { Env } from '@common/config';
import {
  IBaseTranslationResult,
  TranslationSegment,
} from 'src/internal/machine-translation/application/commands/base-translate/base-translate.command';

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

      if (segments.length === 0) {
        this.logger.warn(`No segments to translate`);
        return { results: [] };
      }

      const batchSize = 50;
      const translationResults: {
        segmentId: string;
        translatedText: string;
      }[] = [];

      for (let i = 0; i < segments.length; i += batchSize) {
        const batch = segments.slice(i, i + batchSize);
        const textsToTranslate = batch.map((segment) => segment.content);

        this.logger.debug(
          `Translating batch ${Math.floor(i / batchSize) + 1} with ${textsToTranslate.length} segments`,
        );

        const translationResponse = await this.translator.translateText(
          textsToTranslate,
          sourceLanguage as SourceLanguageCode,
          targetLanguage as TargetLanguageCode,
          {
            tagHandling: 'xml',
            ignoreTags: ['ph'],
          },
        );

        batch.forEach((segment, index) => {
          const translation = translationResponse[index];
          if (!translation) {
            this.logger.warn(
              `No translation returned for segment ${segment.id}`,
            );
            return;
          }

          translationResults.push({
            segmentId: segment.id,
            translatedText: translation.text,
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
}
