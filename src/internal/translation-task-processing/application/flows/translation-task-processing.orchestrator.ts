import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { TranslationStage, TranslationTaskType } from '@prisma/client';
import { Queue } from 'bullmq';
import { TRANSLATION_TASK_PARSING_QUEUES } from '../../infrastructure/queues';
import { TranslationTaskRepository } from '../../../translation-task/infrastructure/repositories/translation-task.repository';

@Injectable()
export class TranslationTaskProcessingOrchestrator {
  private readonly logger = new Logger(
    TranslationTaskProcessingOrchestrator.name,
  );

  constructor(
    @InjectQueue(TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR)
    private readonly orchestratorQueue: Queue,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {}

  async startParsingFlow(
    taskId: string,
    taskType: TranslationTaskType,
  ): Promise<void> {
    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(
          `Cannot start parsing flow: Task ${taskId} not found`,
        );
        return;
      }

      if (task.currentStage !== TranslationStage.QUEUED_FOR_PROCESSING) {
        this.logger.warn(
          `Cannot start parsing flow: Task ${taskId} is not in QUEUED_FOR_PROCESSING stage (current: ${task.currentStage})`,
        );
        return;
      }

      this.logger.log(
        `Starting parsing flow for task ${taskId} of type ${taskType}`,
      );
      await this.orchestratorQueue.add('startFlow', { taskId, taskType });
    } catch (error) {
      this.logger.error(
        `Failed to queue task ${taskId} for processing: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}
