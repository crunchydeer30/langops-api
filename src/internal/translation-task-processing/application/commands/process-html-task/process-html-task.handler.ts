import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import {
  ProcessHtmlTaskCommand,
  ProcessHtmlTaskResponse,
} from './process-html-task.command';
import { BaseProcessTaskHandler } from '../base-process-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { HTMLParsingService, HTMLValidatorService } from '../../services';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';

@Injectable()
@CommandHandler(ProcessHtmlTaskCommand)
export class ProcessHtmlTaskHandler extends BaseProcessTaskHandler {
  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly commandBus: CommandBus,
    private readonly htmlParsingService: HTMLParsingService,
    private readonly htmlValidatorService: HTMLValidatorService,
    private readonly languagePairRepository: LanguagePairRepository,
  ) {
    super(translationTaskRepository, commandBus);
  }

  protected async process(
    task: TranslationTask,
  ): Promise<ProcessHtmlTaskResponse> {
    // 1. Validate HTML
    this.validate(task.originalContent);

    // 2. Get language pair
    const languagePair = await this.languagePairRepository.findById(
      task.languagePairId,
    );

    if (!languagePair) {
      throw new Error(
        `Failed to process task "${task.id}". Language pair "${task.languagePairId}" not found`,
      );
    }

    // 3. Parse HTML and extract segments
    const { segments, originalStructure, sensitiveDataMappings } =
      await this.htmlParsingService.parse(
        task.id,
        task.originalContent,
        languagePair.sourceLanguage.code,
      );

    // 4. Return results (no persistence here)
    return {
      taskId: task.id,
      segments,
      sensitiveDataMappings,
      originalStructure,
    };
  }

  private validate(content: string): void {
    try {
      this.htmlValidatorService.validate(content);
    } catch (error) {
      throw new Error(
        `HTML validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
