import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import {
  ProcessTextTaskCommand,
  ProcessTextTaskResponse,
} from './process-text-task.command';
import { BaseProcessTaskHandler } from '../base-process-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TextParsingService } from '../../services/text-parsing.service';
import { ContentAnonymizationService } from '../../services/content-anonymization.service';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { TranslationTask } from 'src/internal/translation-task/domain';
import {
  OriginalStructure,
  TextNodeStruct,
} from '../../../domain/interfaces/original-structure.interface';

@Injectable()
@CommandHandler(ProcessTextTaskCommand)
export class ProcessTextTaskHandler extends BaseProcessTaskHandler {
  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly commandBus: CommandBus,
    private readonly textParsingService: TextParsingService,
    private readonly anonymizationService: ContentAnonymizationService,
    private readonly languagePairRepository: LanguagePairRepository,
  ) {
    super(translationTaskRepository, commandBus);
  }

  protected async process(
    task: TranslationTask,
  ): Promise<ProcessTextTaskResponse> {
    const languagePair = await this.languagePairRepository.findById(
      task.languagePairId,
    );
    if (!languagePair) {
      throw new Error(
        `Failed to process task "${task.id}". Language pair "${task.languagePairId}" not found`,
      );
    }

    const parseResult = this.textParsingService.parse(task.originalContent);

    const anonymizationResult = await this.anonymizationService.anonymize(
      parseResult.segments,
      languagePair.sourceLanguage.code,
    );

    const segmentArgs = anonymizationResult.segments.map((seg) => ({
      id: seg.id,
      translationTaskId: task.id,
      segmentOrder: seg.segmentOrder,
      segmentType: seg.segmentType,
      sourceContent: seg.sourceContent,
      anonymizedContent: seg.anonymizedContent,
      specialTokensMap: seg.specialTokensMap || undefined,
      formatMetadata: seg.formatMetadata || undefined,
    }));

    const sensitiveDataMappingArgs =
      anonymizationResult.sensitiveDataMappings.map((m) => ({
        id: m.id,
        translationTaskId: task.id,
        tokenIdentifier: m.tokenIdentifier,
        sensitiveType: m.sensitiveType,
        originalValue: m.originalValue,
      }));

    const originalStructure: OriginalStructure = {
      children: parseResult.originalStructure.paragraphs.map(
        (paragraph) => ({ type: 'text', data: paragraph }) as TextNodeStruct,
      ),
    };

    return {
      taskId: task.id,
      segmentArgs,
      sensitiveDataMappingArgs,
      originalStructure,
    };
  }
}
