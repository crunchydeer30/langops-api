import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  ISubmitTranslationTaskResponse,
  SubmitTranslationTaskCommand,
} from './submit-translation-task.command';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { ContentValidationService } from 'src/internal/translation-task/domain/services/content-validation.service';
import { TranslationTaskStatus } from '@prisma/client';

@CommandHandler(SubmitTranslationTaskCommand)
export class SubmitTranslationTaskHandler
  implements ICommandHandler<SubmitTranslationTaskCommand>
{
  private readonly logger = new Logger(SubmitTranslationTaskHandler.name);

  constructor(
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly contentValidationService: ContentValidationService,
  ) {}

  async execute({
    props,
  }: SubmitTranslationTaskCommand): Promise<ISubmitTranslationTaskResponse> {
    const { editorId, taskId, segments } = props;

    this.logger.log(
      `Editor ${editorId} submitting translation task ${taskId} with ${segments.length} segments`,
    );

    if (!segments || segments.length === 0) {
      this.logger.error(`No segments provided for task ${taskId}`);
      throw new DomainException({
        ...ERRORS.TRANSLATION_TASK.VALIDATION_FAILED,
        message: 'No segments provided for submission',
      });
    }

    const taskWithSegments =
      await this.translationTaskRepository.findTaskWithSegments(taskId);

    if (!taskWithSegments) {
      this.logger.error(`Translation task ${taskId} not found`);
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
    }

    const { task } = taskWithSegments;

    if (task.editorId !== editorId) {
      this.logger.error(
        `Editor ${editorId} is not assigned to translation task ${taskId}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_ASSIGNED);
    }

    if (task.status === TranslationTaskStatus.COMPLETED) {
      this.logger.error(`Translation task ${taskId} is already completed`);
      throw new DomainException({
        ...ERRORS.TRANSLATION_TASK.VALIDATION_FAILED,
        message: 'Task is already completed',
      });
    }

    for (const segment of segments) {
      const taskSegment = taskWithSegments.segments.find(
        (s) => s.id === segment.segmentId,
      );

      if (!taskSegment) {
        this.logger.error(
          `Segment ${segment.segmentId} not found in task ${taskId}`,
        );
        throw new DomainException(ERRORS.TRANSLATION_TASK.VALIDATION_FAILED);
      }

      const originalContent =
        taskSegment.machineTranslatedContent || taskSegment.anonymizedContent;

      if (!originalContent) {
        this.logger.error(
          `No original content found for segment ${segment.segmentId}`,
        );
        throw new DomainException(ERRORS.TRANSLATION_TASK.VALIDATION_FAILED);
      }

      const validationResult =
        this.contentValidationService.validateEditedContent(
          originalContent,
          segment.editedContent,
        );

      if (!validationResult.valid) {
        this.logger.error(
          `Validation failed for segment ${segment.segmentId}: ${validationResult.error}`,
        );
        throw new DomainException({
          ...ERRORS.TRANSLATION_TASK.VALIDATION_FAILED,
          message: `Validation failed: ${validationResult.error}`,
        });
      }
    }

    task.setEditedContent(
      segments.map((s) => ({
        segmentId: s.segmentId,
        editedContent: s.editedContent,
      })),
    );

    await this.translationTaskRepository.saveSegmentEdits(taskId, segments);

    task.completeTask();

    await this.translationTaskRepository.save(task);

    this.logger.log(
      `Successfully completed translation task ${taskId} by editor ${editorId}`,
    );

    return {
      success: true,
      translationTaskId: taskId,
    };
  }
}
