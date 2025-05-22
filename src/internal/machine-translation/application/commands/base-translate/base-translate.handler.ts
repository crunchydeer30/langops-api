import { CommandBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import {
  BaseTranslateCommand,
  IBaseTranslationResult,
  TranslationSegment,
} from './base-translate.command';

export abstract class BaseTranslateHandler
  implements ICommandHandler<BaseTranslateCommand, IBaseTranslationResult>
{
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: BaseTranslateCommand,
  ): Promise<IBaseTranslationResult> {
    const { segments, sourceLanguage, targetLanguage } = command.params;

    try {
      const result = await this.translate(
        segments,
        sourceLanguage,
        targetLanguage,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error executing translation command: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  abstract translate(
    segments: TranslationSegment[],
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<IBaseTranslationResult>;
}
