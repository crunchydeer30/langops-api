import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationTaskModule } from '../translation-task/translation.module';
import { TranslationTaskProcessingModule } from '../translation-task-processing/translation-task-parser.module';
import { MachineTranslationEventHandlers } from './application/event-handlers';
import { MachineTranslationProcessors } from './application/processors';
import { BullModule } from '@nestjs/bullmq';
import { MACHINE_TRANSLATION_QUEUE } from './infrastructure/bullmq/constants';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: MACHINE_TRANSLATION_QUEUE,
    }),
    TranslationTaskModule,
    TranslationTaskProcessingModule,
  ],
  providers: [
    ...MachineTranslationEventHandlers,
    ...MachineTranslationProcessors,
  ],
})
export class MachineTranslationModule {}
