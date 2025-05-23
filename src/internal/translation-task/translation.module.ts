import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TranslationTaskMapper,
  TranslationTaskRepository,
} from './infrastructure';
import { CommandHandlers } from './application/commands';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    TranslationTaskMapper,
    TranslationTaskRepository,
  ],
  exports: [TranslationTaskRepository],
})
export class TranslationTaskModule {}
