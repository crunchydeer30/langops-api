import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TranslationTaskParsingFlow } from './application/flows/translation-task-parsing.flow';
import {
  TRANSLATION_TASK_PARSING_FLOW,
  TRANSLATION_TASK_PARSING_QUEUES,
} from './infrastructure/queues';
import { EmailParsingController } from './controllers/email-parsing.controller';
import { EmailParsingService } from './application/services/email-parsing.service';

@Module({
  imports: [
    BullModule.registerFlowProducer({
      name: TRANSLATION_TASK_PARSING_FLOW.name,
    }),
    BullModule.registerQueue(
      {
        name: TRANSLATION_TASK_PARSING_QUEUES.TRANSLATION_TASK_PARSING_FLOW_QUEUE,
      },
      {
        name: TRANSLATION_TASK_PARSING_QUEUES.TRANSLATION_TASK_PARSING_JOBS_QUEUE,
      },
    ),
  ],
  controllers: [EmailParsingController],
  providers: [TranslationTaskParsingFlow, EmailParsingService],
})
export class TranslationTaskParsingModule {}
