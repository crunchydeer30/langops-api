import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeeplCommandHandlers } from './commands';
import { TranslationTaskModule } from 'src/internal/translation-task/translation.module';
import { TranslationTaskProcessingModule } from 'src/internal/translation-task-processing/translation-task-processing.module';

@Module({
  imports: [
    CqrsModule,
    TranslationTaskModule,
    forwardRef(() => TranslationTaskProcessingModule),
  ],
  providers: [...DeeplCommandHandlers],
})
export class DeeplModule {}
