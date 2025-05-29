import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TranslationTaskMapper,
  TranslationTaskRepository,
} from './infrastructure';
import { CommandHandlers } from './application/commands';
import { TranslationTaskController } from './application/controllers';
import { EditorModule } from '../editor/editor.module';
import { LanguageModule } from '../language/language.module';
import { TranslationTasksQueryHandlers } from './application/queries';

@Module({
  imports: [CqrsModule, EditorModule, LanguageModule],
  controllers: [TranslationTaskController],
  providers: [
    ...CommandHandlers,
    ...TranslationTasksQueryHandlers,
    TranslationTaskMapper,
    TranslationTaskRepository,
  ],
  exports: [TranslationTaskRepository],
})
export class TranslationTaskModule {}
