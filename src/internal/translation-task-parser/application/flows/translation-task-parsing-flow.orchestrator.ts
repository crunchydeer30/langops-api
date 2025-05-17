import { Injectable, Logger } from '@nestjs/common';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { FlowProducer } from 'bullmq';
import { TranslationTaskType } from '@prisma/client';
import { EmailTranslationTaskParsingFlowStrategy } from './strategies/email-translation-task-parsing-flow.strategy';
import { TranslationTaskParsingFlowStrategy } from './strategies/translation-task-parsing-flow-strategy.interface';
import { TRANSLATION_TASK_PARSING_FLOWS } from '../../infrastructure/queues';

@Injectable()
export class TranslationTaskParsingFlowOrchestrator {
  private readonly logger = new Logger(
    TranslationTaskParsingFlowOrchestrator.name,
  );
  private readonly strategies: Map<
    TranslationTaskType,
    TranslationTaskParsingFlowStrategy
  >;

  constructor(
    @InjectFlowProducer(TRANSLATION_TASK_PARSING_FLOWS.MAIN.name)
    private readonly flowProducer: FlowProducer,
    private readonly emailFlowStrategy: EmailTranslationTaskParsingFlowStrategy,
  ) {
    this.strategies = new Map();
    this.registerStrategy(this.emailFlowStrategy);
  }

  private registerStrategy(strategy: TranslationTaskParsingFlowStrategy): void {
    const taskType = strategy.getTaskType();
    this.logger.log(`Registering parsing strategy for task type: ${taskType}`);
    this.strategies.set(taskType, strategy);
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
