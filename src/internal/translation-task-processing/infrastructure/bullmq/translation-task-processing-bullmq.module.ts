import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TRANSLATION_TASK_PROCESSING_QUEUE } from '../queues/constants';
@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSLATION_TASK_PROCESSING_QUEUE,
    }),
  ],
  exports: [BullModule],
})
export class TranslationTaskProcessingBullMQModule {}
