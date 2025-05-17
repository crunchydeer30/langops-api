import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../infrastructure/queues/constants';
import { Job } from 'bullmq';
import { TranslationTaskValidationService } from '../services/translation-task-validation.service';
import { EmailParsingService } from '../services/email-parsing.service';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';

@Injectable()
@Processor(TRANSLATION_TASK_PARSING_QUEUES.EMAIL_JOBS)
export class EmailTranslationTaskParsingProcessor extends WorkerHost {
  private readonly logger = new Logger(
    EmailTranslationTaskParsingProcessor.name,
  );

  constructor(
    private readonly validationService: TranslationTaskValidationService,
    private readonly emailParsingService: EmailParsingService,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {
    super();
  }

  async process(job: Job<{ taskId: string }, any>): Promise<any> {
    switch (job.name) {
      case TRANSLATION_TASK_PARSING_FLOWS.EMAIL.JOBS.VALIDATE.name:
        await this.handleValidationJob(job);
        return;
      case TRANSLATION_TASK_PARSING_FLOWS.EMAIL.JOBS.PARSE.name:
        await this.handleParsingJob(job);
        return;
      default:
        this.logger.error(
          `Unsupported job ${job.name} in ${EmailTranslationTaskParsingProcessor.name}`,
        );
    }
  }

  private async handleValidationJob(
    job: Job<{ taskId: string }, any>,
  ): Promise<void> {
    const { taskId } = job.data;
    this.logger.log(`Processing validation job for task ${taskId}`);

    try {
      await this.validationService.validateTask(taskId);

      this.logger.log(`Task ${taskId} validated successfully`);
    } catch (error) {
      await this.handleValidationError(taskId, error);
    }
  }

  private async handleParsingJob(
    job: Job<{ taskId: string }, any>,
  ): Promise<void> {
    const { taskId } = job.data;
    this.logger.log(`Processing parsing job for task ${taskId}`);

    try {
      await this.emailParsingService.parseEmailTask(taskId);
      this.logger.log(`Task ${taskId} parsed successfully`);
    } catch (error) {
      this.logger.error(
        `Parsing job failed for task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async handleValidationError(
    taskId: string,
    error: unknown,
  ): Promise<void> {
    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(`Task ${taskId} not found for error handling`);
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown validation error';

      task.markAsRejected(errorMessage);

      await this.translationTaskRepository.save(task);

      this.logger.warn(`Task ${taskId} rejected: ${errorMessage}`);
    } catch (saveError) {
      const errorMessage =
        saveError instanceof Error ? saveError.message : String(saveError);

      this.logger.error(`Failed to update task ${taskId}: ${errorMessage}`);
    }
  }
}
