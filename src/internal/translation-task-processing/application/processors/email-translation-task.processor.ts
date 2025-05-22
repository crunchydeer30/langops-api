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
import { EventPublisher } from '@nestjs/cqrs';

@Injectable()
@Processor(TRANSLATION_TASK_PARSING_QUEUES.EMAIL_JOBS)
export class EmailTranslationTaskProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailTranslationTaskProcessor.name);

  constructor(
    private readonly validationService: TranslationTaskValidationService,
    private readonly emailProcessingService: EmailProcessingService,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly eventPublisher: EventPublisher,
  ) {
    super();
  }

  async process(job: Job<{ taskId: string }, any>): Promise<any> {
    const { taskId } = job.data;
    switch (job.name) {
      case TRANSLATION_TASK_PARSING_FLOWS.EMAIL.JOBS.VALIDATE.name:
        await this.handleValidationJob(taskId);
        return;
      case TRANSLATION_TASK_PARSING_FLOWS.EMAIL.JOBS.PARSE.name:
        await this.handleProcessingJob(taskId);
        return;
      default:
        this.logger.error(
          `Unsupported job ${job.name} in ${EmailTranslationTaskProcessor.name}`,
        );
        throw new Error(
          `Unsupported job ${job.name} in ${EmailTranslationTaskProcessor.name}`,
        );
    }
  }

  private async handleValidationJob(taskId: string): Promise<void> {
    this.logger.debug(
      `Validating task ${taskId} of type ${TranslationTaskType.EMAIL}`,
    );
    const task = await this.translationTaskRepository.findById(taskId);

    try {
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }
      this.eventPublisher.mergeObjectContext(task);
      this.validationService.validateTask(task);
      this.logger.debug(
        `Task ${taskId} of type ${TranslationTaskType.EMAIL} validated successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Task ${taskId} of type ${TranslationTaskType.EMAIL} failed validation with error: ${JSON.stringify(error)}`,
      );
      if (task) {
        task.handleProcessingError(JSON.stringify(error));
        await this.translationTaskRepository.save(task);
        task.commit();
      }
      throw error;
    }
  }

  private async handleProcessingJob(taskId: string): Promise<void> {
    this.logger.log(`Processing email task ${taskId}`);
    const task = await this.translationTaskRepository.findById(taskId);

    try {
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }
      this.eventPublisher.mergeObjectContext(task);

      // const { wordCount, segmentCount, templatedContent } =
      await this.emailProcessingService.parseEmailTask(taskId);

      // task.wordCount = wordCount;
      // task.templatedContent = templatedContent;
      // await this.translationTaskRepository.save(task);
      // task.commit();

      // this.logger.debug(
      //   `Email task ${taskId} processed successfully: ${segmentCount} segments, ${wordCount} words`,
      // );
    } catch (error) {
      this.logger.error(
        `Error during processing email task ${taskId}: ${JSON.stringify(error)}`,
      );
      if (task) {
        task.handleProcessingError(JSON.stringify(error));
        await this.translationTaskRepository.save(task);
        task.commit();
      }
      throw error;
    }
  }
}
