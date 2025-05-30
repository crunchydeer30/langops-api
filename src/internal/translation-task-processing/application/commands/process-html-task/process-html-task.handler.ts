import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import {
  ProcessHtmlTaskCommand,
  ProcessHtmlTaskResponse,
} from './process-html-task.command';
import { BaseProcessTaskHandler } from '../base-process-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import {
  HTMLParsingService,
  HTMLValidatorService,
  ContentAnonymizationService,
  AnonymizedSegmentDto,
} from '../../services';
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
    private readonly anonymizationService: ContentAnonymizationService,
    private readonly languagePairRepository: LanguagePairRepository,
  ) {
    super(translationTaskRepository, commandBus);
  }

  protected async process(
    task: TranslationTask,
  ): Promise<ProcessHtmlTaskResponse> {
    this.htmlValidatorService.validate(task.originalContent);

    const languagePair = await this.languagePairRepository.findById(
      task.languagePairId,
    );

    if (!languagePair) {
      throw new Error(
        `Failed to process task "${task.id}". Language pair "${task.languagePairId}" not found`,
      );
    }

    const parseResult = this.htmlParsingService.parse(task.originalContent);

    const anonymizationResult = await this.anonymizationService.anonymize(
      parseResult.segments,
      languagePair.sourceLanguage.code,
    );

    const segmentArgs = anonymizationResult.segments.map(
      (segmentDto: AnonymizedSegmentDto) => ({
        id: segmentDto.id,
        translationTaskId: task.id,
        segmentOrder: segmentDto.segmentOrder,
        segmentType: segmentDto.segmentType,
        sourceContent: segmentDto.sourceContent,
        specialTokensMap: segmentDto.specialTokensMap || undefined,
        formatMetadata: segmentDto.formatMetadata || undefined,
      }),
    );

    const sensitiveDataMappingArgs =
      anonymizationResult.sensitiveDataMappings.map((mappingDto) => ({
        id: mappingDto.id,
        translationTaskId: task.id,
        tokenIdentifier: mappingDto.tokenIdentifier,
        sensitiveType: mappingDto.sensitiveType,
        originalValue: mappingDto.originalValue,
      }));

    return {
      taskId: task.id,
      segmentArgs,
      sensitiveDataMappingArgs,
      originalStructure: parseResult.originalStructure,
    };
  }
}
