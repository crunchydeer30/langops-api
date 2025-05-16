import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TranslationTaskMapper,
  TranslationTaskRepository,
} from './infrastructure';
import { CommandHandlers } from './application/commands';
import { EventHandlers } from './application/event-handlers';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    TranslationTaskMapper,
    TranslationTaskRepository,
  ],
})
export class TranslationTaskModule {}
