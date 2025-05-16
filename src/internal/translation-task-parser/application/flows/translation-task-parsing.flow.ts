import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer } from 'bullmq';
import { TRANSLATION_TASK_PARSING_FLOW } from '../../infrastructure/queues';

@Injectable()
export class TranslationTaskParsingFlow {
  private readonly logger = new Logger(TranslationTaskParsingFlow.name);

  constructor(
    @InjectFlowProducer(TRANSLATION_TASK_PARSING_FLOW.name)
    private readonly flowProducer: FlowProducer,
  ) {}

  async start(taskId: string) {
    try {
      this.logger.debug(
        `[TRANSLATION TASK PARSING FLOW] starting for task ID: ${taskId}`,
      );

      await this.flowProducer.add({
        name: `${TRANSLATION_TASK_PARSING_FLOW.name}:${taskId}`,
        queueName: TRANSLATION_TASK_PARSING_FLOW.queue,
        children: [],
      });

      this.logger.log(
        `[TRANSLATION TASK PARSING FLOW] started  for task ID: ${taskId}`,
      );
    } catch (e) {
      this.logger.error(
        `[TRANSLATION TASK PARSING FLOW] failed to start: ${JSON.stringify(e)}`,
      );
    }
  }
}
