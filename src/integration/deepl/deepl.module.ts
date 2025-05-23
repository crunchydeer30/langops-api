import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeeplCommandHandlers } from './commands';
import { TranslationTaskModule } from 'src/internal/translation-task/translation-task.module';

@Module({
  imports: [CqrsModule, TranslationTaskModule],
  providers: [...DeeplCommandHandlers],
})
export class DeeplModule {}
