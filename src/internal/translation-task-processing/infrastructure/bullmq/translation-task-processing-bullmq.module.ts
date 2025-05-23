import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../queues/constants';
@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR,
    }),
    BullModule.registerFlowProducer({
      name: TRANSLATION_TASK_PARSING_FLOWS.ORCHESTRATOR.name,
    }),
    BullModule.registerFlowProducer({
      name: TRANSLATION_TASK_PARSING_FLOWS.HTML.name,
    }),
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.HTML_FLOW,
    }),
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.HTML_JOBS,
    }),
  ],
  exports: [BullModule],
})
export class TranslationTaskProcessingBullMQModule {}
