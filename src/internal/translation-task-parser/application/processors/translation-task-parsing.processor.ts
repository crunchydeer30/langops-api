import { InjectFlowProducer, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer, Job } from 'bullmq';
import {
  EmailTranslationTaskParsingFlowStrategy,
  TranslationTaskParsingFlowStrategy,
} from '../flows';
import { TranslationTaskType } from '@prisma/client';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../../infrastructure/queues';

@Injectable()
@Processor(TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR, { concurrency: 3 })
export class TranslationTaskParsingOrchestratorProcessor extends WorkerHost {
  private readonly logger = new Logger(
    TranslationTaskParsingOrchestratorProcessor.name,
  );
  private readonly strategies: Map<
    TranslationTaskType,
    TranslationTaskParsingFlowStrategy
  >;

  constructor(
    @InjectFlowProducer(TRANSLATION_TASK_PARSING_FLOWS.ORCHESTRATOR.name)
    private readonly flowProducer: FlowProducer,
    private readonly emailFlowStrategy: EmailTranslationTaskParsingFlowStrategy,
  ) {
    super();
    this.strategies = new Map();
    this.registerStrategy(this.emailFlowStrategy);
  }

  private registerStrategy(strategy: TranslationTaskParsingFlowStrategy): void {
    const taskType = strategy.getTaskType();
    this.logger.log(`Registering parsing strategy for task type: ${taskType}`);
    this.strategies.set(taskType, strategy);
  }

  async process(job: Job<{ taskId: string; taskType: TranslationTaskType }>) {
    switch (job.name) {
      case 'startFlow':
        await this.startParsingFlow(job.data.taskId, job.data.taskType);
        break;
      default:
        console.log('COMMAND NOT FOUND');
    }
  }

  async startParsingFlow(
    taskId: string,
    taskType: TranslationTaskType,
  ): Promise<void> {
    try {
      this.logger.log(
        `Starting parsing flow for task ${taskId} of type ${taskType}`,
      );

      if (taskType !== TranslationTaskType.EMAIL) {
        this.logger.warn(
          `Task type ${taskType} not yet supported, only EMAIL type is currently implemented`,
        );
        return;
      }

      const strategy = this.strategies.get(taskType);
      if (!strategy) {
        throw new Error(
          `No parsing flow strategy registered for task type: ${taskType}`,
        );
      }

      const flowConfig = strategy.generateFlowConfig(taskId);
      await this.flowProducer.add(flowConfig);

      this.logger.log(`Parsing flow started for task ${taskId}`);
    } catch (error) {
      this.logger.error(
        `Failed to start parsing flow for task ${taskId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
