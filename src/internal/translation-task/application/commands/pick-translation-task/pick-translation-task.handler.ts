import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PickTranslationTaskCommand } from './pick-translation-task.command';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';

export interface IPickTranslationTaskResponse {
  translationTaskId: string;
  languagePairId: string;
  sourceLanguage: string;
  targetLanguage: string;
  isEvaluationTask: boolean;
  wordCount: number;
  segments: Array<{
    segmentId: string;
    segmentOrder: number;
    segmentType: string;
    anonymizedContent: string | null;
    machineTranslatedContent: string | null;
  }>;
}

@CommandHandler(PickTranslationTaskCommand)
export class PickTranslationTaskHandler
  implements ICommandHandler<PickTranslationTaskCommand>
{
  private readonly logger = new Logger(PickTranslationTaskHandler.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly languagePairRepository: LanguagePairRepository,
  ) {}

  async execute(
    command: PickTranslationTaskCommand,
  ): Promise<IPickTranslationTaskResponse> {
    const { editorId, languagePairId } = command.payload;

    this.logger.log(
      `Editor ${editorId} trying to pick a translation task for language pair ${languagePairId}`,
    );

    const languagePair =
      await this.languagePairRepository.findById(languagePairId);
    if (!languagePair) {
      this.logger.error(`Language pair ${languagePairId} not found`);
      throw new DomainException(ERRORS.LANGUAGE.NOT_FOUND);
    }

    const isQualified =
      await this.translationTaskRepository.isEditorQualifiedForLanguagePair(
        editorId,
        languagePairId,
      );

    if (!isQualified) {
      this.logger.warn(
        `Editor ${editorId} is not qualified for language pair ${languagePairId}`,
      );
      throw new DomainException(ERRORS.EDITOR.NOT_QUALIFIED_FOR_LANGUAGE_PAIR);
    }

    const task =
      await this.translationTaskRepository.findTranslationTaskForEditor(
        editorId,
        languagePairId,
      );

    if (!task) {
      this.logger.warn(
        `No available translation tasks found for editor ${editorId} in language pair ${languagePairId}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    task.startEditing(editorId);
    await this.translationTaskRepository.save(task);

    const taskWithSegments =
      await this.translationTaskRepository.findTaskWithSegments(task.id);
    if (!taskWithSegments) {
      this.logger.error(`Failed to fetch segments for task ${task.id}`);
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    this.logger.log(
      `Translation task ${task.id} with ${taskWithSegments.segments.length} segments assigned to editor ${editorId} successfully`,
    );

    const mappedSegments = taskWithSegments.segments.map((segment) => ({
      segmentId: segment.id,
      segmentOrder: segment.segmentOrder,
      segmentType: segment.segmentType,
      anonymizedContent: segment.anonymizedContent,
      machineTranslatedContent: segment.machineTranslatedContent,
    }));

    return {
      translationTaskId: task.id,
      languagePairId: task.languagePairId,
      sourceLanguage: languagePair.sourceLanguageCode,
      targetLanguage: languagePair.targetLanguageCode,
      isEvaluationTask: task.isEvaluationTask,
      wordCount: task.wordCount,
      segments: mappedSegments,
    };
  }
}
