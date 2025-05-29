import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TranslationTaskMapper,
  TranslationTaskRepository,
} from './infrastructure';
import { CommandHandlers } from './application/commands';
import { TranslationTaskController } from './application/controllers';
import { GetAvailableTasksHandler } from './application/queries/get-available-tasks/get-available-tasks.handler';
import { EditorModule } from '../editor/editor.module';
import { LanguageModule } from '../language/language.module';

const QueryHandlers = [GetAvailableTasksHandler];

@Module({
  imports: [CqrsModule, EditorModule, LanguageModule],
  controllers: [TranslationTaskController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    TranslationTaskMapper,
    TranslationTaskRepository,
  ],
  exports: [TranslationTaskRepository],
})
export class TranslationTaskModule {}
