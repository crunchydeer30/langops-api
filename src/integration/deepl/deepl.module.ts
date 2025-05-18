import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeeplCommandHandlers } from './commands';
import { TranslationTaskModule } from 'src/internal/translation-task/translation.module';
import { TranslationTaskProcessingModule } from 'src/internal/translation-task-processing/translation-task-parser.module';

@Module({
  imports: [CqrsModule, TranslationTaskModule, TranslationTaskProcessingModule],
  providers: [...DeeplCommandHandlers],
})
export class DeeplModule {}
