import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../infrastructure/queues/constants';
import { Job } from 'bullmq';
import { TranslationTaskValidationService } from '../services/translation-task-validation.service';
import { EmailProcessingService } from '../services/email-processing.service';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';
import { TranslationTaskType } from '@prisma/client';
import { TranslationTask } from 'src/internal/translation-task/domain';

@Injectable()
@Processor(TRANSLATION_TASK_PARSING_QUEUES.EMAIL_JOBS)
export class EmailTranslationTaskProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailTranslationTaskProcessor.name);

  constructor(
    private readonly validationService: TranslationTaskValidationService,
    private readonly emailProcessingService: EmailProcessingService,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {
    super();
  }

  async process(job: Job<{ taskId: string }, any>): Promise<any> {
    const { taskId } = job.data;

    try {
      const taskData = await this.translationTaskRepository.findById(taskId);
      if (!taskData) {
        this.logger.error(`Task ${taskId} not found for processing`);
        return;
      }

      const task = taskData;

      switch (job.name) {
        case TRANSLATION_TASK_PARSING_FLOWS.EMAIL.JOBS.VALIDATE.name:
          await this.handleValidationJob(task, job);
          return;
        case TRANSLATION_TASK_PARSING_FLOWS.EMAIL.JOBS.PARSE.name:
          await this.handleProcessingJob(task, job);
          return;
        default:
          this.logger.error(
            `Unsupported job ${job.name} in ${EmailTranslationTaskProcessor.name}`,
          );
      }
    } catch (processError) {
      this.logger.error(
        `Error processing job ${job.name} for task ${taskId}: ${JSON.stringify(processError)}`,
      );
    }
  }

  private async handleValidationJob(
    task: TranslationTask,
    job: Job<{ taskId: string }, any>,
  ): Promise<void> {
    const { taskId } = job.data;
    this.logger.debug(
      `Validating task ${taskId} of type ${TranslationTaskType.EMAIL}`,
    );

    try {
      await this.validationService.validateTask(taskId);
      this.logger.debug(
        `Task ${taskId} of type ${TranslationTaskType.EMAIL} validated successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Task ${taskId} of type ${TranslationTaskType.EMAIL} failed validation`,
      );
      // Don't handle error state here - let the orchestrator detect the error through job failure
      throw error; // Propagate error to BullMQ for flow control
    }
  }

  private async handleProcessingJob(
    task: TranslationTask,
    job: Job<{ taskId: string }, any>,
  ): Promise<void> {
    const { taskId } = job.data;
    this.logger.log(`Processing email task ${taskId}`);

    try {
      // The email processing service now returns word count info
      const { wordCount, segmentCount } =
        await this.emailProcessingService.parseEmailTask(taskId);

      // Update word count in the task entity
      // Note: We don't change task state here, the orchestrator does that
      task.wordCount = wordCount;
      await this.translationTaskRepository.save(task);

      this.logger.debug(
        `Email task ${taskId} processed successfully: ${segmentCount} segments, ${wordCount} words`,
      );
    } catch (error) {
      this.logger.error(
        `Error during processing email task ${taskId}: ${JSON.stringify(error)}`,
      );
      // Don't handle error state here - let the orchestrator detect the error through job failure
      throw error; // Propagate error to BullMQ for flow control
    }
  }
}
