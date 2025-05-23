import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TranslationTaskMapper,
  TranslationTaskRepository,
  TranslationTaskReadRepository,
} from './infrastructure';
import { CommandHandlers } from './application/commands';

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    TranslationTaskMapper,
    TranslationTaskRepository,
    TranslationTaskReadRepository,
  ],
  exports: [TranslationTaskRepository, TranslationTaskReadRepository],
})
export class TranslationTaskModule {}
