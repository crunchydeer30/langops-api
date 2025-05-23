import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TranslationTaskModule } from '../translation-task/translation-task.module';
import { TranslationTaskProcessingModule } from '../translation-task-processing/translation-task-processing.module';
import { MachineTranslationEventHandlers } from './application/event-handlers';
import { MachineTranslationProcessors } from './application/processors';
import { MachineTranslationCommandHandlers } from './application/commands';
import { BullModule } from '@nestjs/bullmq';
import { MACHINE_TRANSLATION_QUEUE } from './infrastructure/bullmq/constants';
import { LanguageModule } from '../language/language.module';

@Module({
  imports: [
    CqrsModule,
    BullModule.registerQueue({
      name: MACHINE_TRANSLATION_QUEUE,
    }),
    TranslationTaskModule,
    TranslationTaskProcessingModule,
    LanguageModule,
  ],
  providers: [
    ...MachineTranslationEventHandlers,
    ...MachineTranslationProcessors,
    ...MachineTranslationCommandHandlers,
  ],
})
export class MachineTranslationModule {}
