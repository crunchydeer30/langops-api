import { InjectFlowProducer, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer, Job } from 'bullmq';
import {
  HTMLProcessingFlowStrategy,
  TranslationTaskProcessingFlowStrategy,
} from '../flows';
import { TranslationTaskType } from '@prisma/client';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../infrastructure/queues';
import { EventPublisher } from '@nestjs/cqrs';
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
    private readonly htmlFlowStrategy: HTMLProcessingFlowStrategy,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly eventPublisher: EventPublisher,
  ) {
    super();
    this.strategies = new Map();
    this.registerStrategy(this.htmlFlowStrategy);
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
    const { taskId, taskType } = job.data;
    switch (job.name) {
      case 'startFlow':
        await this.start(taskId, taskType);
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
    }
  }

  async start(taskId: string, taskType: TranslationTaskType): Promise<void> {
    this.logger.log(
      `Preparing processing flow for task ${taskId} of type ${taskType}`,
    );
    const task = await this.translationTaskRepository.findById(taskId);

    try {
      if (!task) {
        throw Error(`Task ${taskId} not found`);
      }
      this.eventPublisher.mergeObjectContext(task);

      if (taskType !== TranslationTaskType.HTML) {
        throw Error(`Task type ${taskType} is not supported`);
      }

      const strategy = this.strategies.get(taskType);
      if (!strategy) {
        throw new Error(
          `Unable to process task of type ${taskType}. Strategy not found!`,
        );
      }

      task.startProcessing();
      await this.translationTaskRepository.save(task);
      task.commit();

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
        `Failed to start processing flow for task ${taskId}: ${JSON.stringify(error)}`,
      );
      if (task) {
        task.handleProcessingError(JSON.stringify(error));
        await this.translationTaskRepository.save(task);
        task.commit();
      }
      throw error;
    }
  }

  private async handleFlowCompletion(
    taskId: string,
    taskType: TranslationTaskType,
  ): Promise<void> {
    const task = await this.translationTaskRepository.findById(taskId);
    try {
      if (!task) {
        throw new Error(`Task ${taskId} not found for completion notification`);
      }
      this.eventPublisher.mergeObjectContext(task);

      task.completeProcessing();
      await this.translationTaskRepository.save(task);
      task.commit();

      this.logger.log(
        `Task ${taskId} of type ${taskType} processing completed successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling flow completion for task ${taskId}: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
      throw error;
    }
  }
}
