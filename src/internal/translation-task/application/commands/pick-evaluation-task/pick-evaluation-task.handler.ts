import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  IPickEvaluationTaskResponse,
  PickEvaluationTaskCommand,
} from './pick-evaluation-task.command';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';

@CommandHandler(PickEvaluationTaskCommand)
export class PickEvaluationTaskHandler
  implements ICommandHandler<PickEvaluationTaskCommand>
{
  private readonly logger = new Logger(PickEvaluationTaskHandler.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly languagePairRepository: LanguagePairRepository,
  ) {}

  async execute({
    props,
  }: PickEvaluationTaskCommand): Promise<IPickEvaluationTaskResponse> {
    const { editorId, languagePairId } = props;

    this.logger.log(
      `Editor ${editorId} trying to pick an evaluation task for language pair ${languagePairId}`,
    );

    const languagePair =
      await this.languagePairRepository.findById(languagePairId);
    if (!languagePair) {
      this.logger.error(`Language pair ${languagePairId} not found`);
      throw new DomainException(ERRORS.LANGUAGE.NOT_FOUND);
    }

    const isEligible =
      await this.translationTaskRepository.isEditorEligibleForEvaluation(
        editorId,
        languagePairId,
      );

    if (!isEligible) {
      this.logger.warn(
        `Editor ${editorId} is not eligible for evaluation in language pair ${languagePairId}`,
      );
      throw new DomainException(ERRORS.EDITOR.NOT_QUALIFIED_FOR_LANGUAGE_PAIR);
    }

    const task =
      await this.translationTaskRepository.findEvaluationTaskForEditor(
        editorId,
        languagePairId,
      );

    if (!task) {
      this.logger.warn(
        `No available evaluation tasks found for editor ${editorId} in language pair ${languagePairId}`,
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
      `Evaluation task ${task.id} with ${taskWithSegments.segments.length} segments assigned to editor ${editorId} successfully`,
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
