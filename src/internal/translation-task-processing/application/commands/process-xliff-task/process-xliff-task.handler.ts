import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import {
  ProcessXliffTaskCommand,
  ProcessXliffTaskResponse,
} from './process-xliff-task.command';
import { BaseProcessTaskHandler } from '../base-process-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import {
  XliffParsingService,
  ContentAnonymizationService,
} from '../../services';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories';
import { TranslationTask } from 'src/internal/translation-task/domain';

@Injectable()
@CommandHandler(ProcessXliffTaskCommand)
export class ProcessXliffTaskHandler extends BaseProcessTaskHandler {
  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly commandBus: CommandBus,
    private readonly xliffParsingService: XliffParsingService,
    private readonly anonymizationService: ContentAnonymizationService,
    private readonly languagePairRepository: LanguagePairRepository,
  ) {
    super(translationTaskRepository, commandBus);
  }

  protected async process(
    task: TranslationTask,
  ): Promise<ProcessXliffTaskResponse> {
    const languagePair = await this.languagePairRepository.findById(
      task.languagePairId,
    );
    if (!languagePair) {
      throw new Error(
        `Failed to process task "${task.id}". Language pair "${task.languagePairId}" not found`,
      );
    }

    const parseResult = this.xliffParsingService.parse(task.originalContent);
    const segments = parseResult.segments;

    if (!segments.length || !segments[0].sourceContent) {
      this.logger.error(
        'No segments or empty sourceContent found in XLIFF parsing',
      );
      throw new Error('No translatable content found in XLIFF file');
    }

    const anonymizationResult = await this.anonymizationService.anonymize(
      segments,
      languagePair.sourceLanguage.code,
    );

    const segmentArgs = anonymizationResult.segments.map((s) => ({
      id: s.id,
      translationTaskId: task.id,
      segmentOrder: s.segmentOrder,
      segmentType: s.segmentType,
      sourceContent: s.sourceContent,
      specialTokensMap: s.specialTokensMap || undefined,
      formatMetadata: s.formatMetadata || undefined,
    }));

    const sensitiveDataMappingArgs =
      anonymizationResult.sensitiveDataMappings.map((m) => ({
        id: m.id,
        translationSegmentId: m.translationSegmentId,
        tokenIdentifier: m.tokenIdentifier,
        sensitiveType: m.sensitiveType,
        originalValue: m.originalValue,
      }));

    return {
      taskId: task.id,
      segmentArgs,
      sensitiveDataMappingArgs,
      originalStructure: null,
    };
  }
}
