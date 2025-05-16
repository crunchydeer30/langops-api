import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TranslationTaskMapper,
  TranslationTaskRepository,
} from './infrastructure';

@Module({
  imports: [CqrsModule],
  providers: [TranslationTaskMapper, TranslationTaskRepository],
})
export class TranslationModule {}
