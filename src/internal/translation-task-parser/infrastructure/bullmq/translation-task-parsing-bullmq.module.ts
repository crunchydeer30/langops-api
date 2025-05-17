import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import {
  TRANSLATION_TASK_PARSING_FLOWS,
  TRANSLATION_TASK_PARSING_QUEUES,
} from '../queues/constants';

@Module({
  imports: [
    BullModule.registerFlowProducer({
      name: TRANSLATION_TASK_PARSING_FLOWS.MAIN.name,
    }),
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.MAIN_FLOW,
    }),
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.MAIN_JOBS,
    }),
    BullModule.registerFlowProducer({
      name: TRANSLATION_TASK_PARSING_FLOWS.EMAIL.name,
    }),
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.EMAIL_FLOW,
    }),
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PARSING_QUEUES.EMAIL_JOBS,
    }),
  ],
  exports: [BullModule],
})
export class TranslationTaskParsingBullMQModule {}
