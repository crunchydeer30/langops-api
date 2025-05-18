import { InjectFlowProducer, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer, Job } from 'bullmq';
import {
  EmailProcessingFlowStrategy,
  TranslationTaskProcessingFlowStrategy,
} from '../flows';
import { TranslationTaskStatus, TranslationTaskType } from '@prisma/client';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../infrastructure/queues';
import { EventBus } from '@nestjs/cqrs';
import { TranslationTaskRepository } from '../../../translation-task/infrastructure/repositories/translation-task.repository';

@Injectable()
@Processor(TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR, { concurrency: 3 })
export class TranslationTaskProcessingOrchestratorProcessor extends WorkerHost {
  private readonly logger = new Logger(
    TranslationTaskProcessingOrchestratorProcessor.name,
  );
  private readonly strategies: Map<
    TranslationTaskType,
    TranslationTaskProcessingFlowStrategy
  >;

  constructor(
    @InjectFlowProducer(TRANSLATION_TASK_PARSING_FLOWS.ORCHESTRATOR.name)
    private readonly flowProducer: FlowProducer,
    private readonly emailFlowStrategy: EmailProcessingFlowStrategy,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly eventBus: EventBus,
  ) {
    super();
    this.strategies = new Map();
    this.registerStrategy(this.emailFlowStrategy);
  }

  private registerStrategy(
    strategy: TranslationTaskProcessingFlowStrategy,
  ): void {
    const taskType = strategy.getTaskType();
    this.logger.log(`Registering parsing strategy for task type: ${taskType}`);
    this.strategies.set(taskType, strategy);
  }

  async process(
    job: Job<{
      taskId: string;
      taskType: TranslationTaskType;
      childrenFailed?: { job: { name: string }; failedReason: string }[];
    }>,
  ) {
    const { taskId, taskType, childrenFailed } = job.data;

    try {
      if (childrenFailed && childrenFailed.length > 0) {
        this.logger.warn(
          `Task ${taskId} had ${childrenFailed.length} failed child jobs. Handling as error.`,
        );
        const firstFailedJob = childrenFailed[0];
        const errorMsg = `Job ${firstFailedJob.job.name} failed: ${firstFailedJob.failedReason || 'Unknown error'}`;

        await this.handleError(taskId, new Error(errorMsg));
        return;
      }

      switch (job.name) {
        case 'startFlow':
          await this.startParsingFlow(taskId, taskType);
          break;
        case 'task-processing-complete':
          this.logger.debug(
            `Task ${taskId} processed successfully. Updating status`,
          );
          await this.handleFlowCompletion(taskId, taskType);
          break;
        default:
          this.logger.error(
            `Unable to process job ${JSON.stringify(job)}. No handler found`,
          );
          await this.handleError(
            taskId,
            new Error(`Unsupported job type ${job.name}`),
          );
      }
    } catch (error) {
      this.logger.error(
        `Error processing orchestrator job ${job.name} for task ${taskId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      await this.handleError(taskId, error);
    }
  }

  async startParsingFlow(
    taskId: string,
    taskType: TranslationTaskType,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting processing flow for task ${taskId} of type ${taskType}`,
      );

      if (taskType !== TranslationTaskType.EMAIL) {
        this.logger.error(`Task type ${taskType} is not supported`);
        await this.handleError(taskId, taskType);
        return;
      }

      const strategy = this.strategies.get(taskType);
      if (!strategy) {
        this.logger.error(
          `Unable to process task of type ${taskType}. Strategy not found!`,
        );
        await this.handleError(
          taskId,
          new Error(`Strategy not found for task type: ${taskType}`),
        );
        return;
      }

      await this.markTaskProcessingStarted(taskId);

      const flowConfig = strategy.generateFlowConfig(taskId);

      await this.flowProducer.add({
        name: 'task-processing-complete',
        data: { taskId, taskType },
        queueName: TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR,
        children: flowConfig,
        opts: {
          failParentOnFailure: true,
        },
      });

      this.logger.debug(
        `Created processing flow for task ${taskId} of type ${taskType}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to start processing flow for task ${taskId}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      await this.handleError(taskId, error);
    }
  }

  private async handleError(taskId: string, error: unknown): Promise<void> {
    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(`Task ${taskId} not found for error handling`);
        return;
      }

      if (task.status === TranslationTaskStatus.ERROR) {
        this.logger.warn(
          `Task ${taskId} is already in ERROR state, not updating error message`,
        );
        return;
      }

      if (task.status !== TranslationTaskStatus.IN_PROGRESS) {
        this.logger.warn(
          `Task ${taskId} is in ${task.status} state, manually setting to ERROR`,
        );
        task.status = TranslationTaskStatus.ERROR;
        task.errorMessage =
          error instanceof Error ? error.message : JSON.stringify(error);
        await this.translationTaskRepository.save(task);
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);

      task.handleProcessingError(errorMessage);
      await this.translationTaskRepository.save(task);

      this.logger.error(`Task ${taskId} error: ${errorMessage}`);
    } catch (saveError) {
      this.logger.error(
        `Failed to handle error for task ${taskId}: ${saveError instanceof Error ? saveError.message : JSON.stringify(saveError)}`,
      );
    }
  }

  private async markTaskProcessingStarted(taskId: string): Promise<void> {
    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(`Task ${taskId} not found for marking as processing`);
        return;
      }

      if (task.status === TranslationTaskStatus.IN_PROGRESS) {
        this.logger.warn(`Task ${taskId} is already in IN_PROGRESS state`);
        return;
      }

      if (task.status === TranslationTaskStatus.ERROR) {
        this.logger.warn(
          `Task ${taskId} is in ERROR state, cannot start processing`,
        );
        return;
      }

      task.startProcessing();
      await this.translationTaskRepository.save(task);

      this.logger.debug(`Task ${taskId} processing started`);
    } catch (error) {
      this.logger.error(
        `Failed to mark task ${taskId} as processing: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
      await this.handleError(taskId, error);
    }
  }

  private async handleFlowCompletion(
    taskId: string,
    taskType: TranslationTaskType,
  ): Promise<void> {
    try {
      const task = await this.translationTaskRepository.findById(taskId);
      if (!task) {
        this.logger.error(
          `Task ${taskId} not found for completion notification`,
        );
        return;
      }

      if (task.status === TranslationTaskStatus.ERROR) {
        this.logger.warn(
          `Task ${taskId} is already in ERROR state, skipping completion`,
        );
        return;
      }

      task.completeProcessing();
      await this.translationTaskRepository.save(task);

      this.logger.log(
        `Task ${taskId} of type ${taskType} processing completed successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling flow completion for task ${taskId}: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
    }
  }
}
