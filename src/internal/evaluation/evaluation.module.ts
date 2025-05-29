import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  EvaluationTaskRepository,
  EvaluationSetRepository,
} from './infrastructure/repositories';
import {
  EvaluationTaskMapper,
  EvaluationSetMapper,
} from './infrastructure/mappers';
import { EvaluationCommandHandlers } from './application/commands';
import { EvaluationController } from './application/controllers';
import { EditorModule } from '../editor/editor.module';
import { LanguageModule } from '../language/language.module';
import { TranslationTaskModule } from '../translation-task/translation-task.module';
import { EvaluationEventHandlers } from './application/event-handlers';
import { EvaluationQueryHandlers } from './application/queries';

@Module({
  imports: [CqrsModule, EditorModule, LanguageModule, TranslationTaskModule],
  controllers: [EvaluationController],
  providers: [
    EvaluationTaskRepository,
    EvaluationTaskMapper,
    EvaluationSetRepository,
    EvaluationSetMapper,
    ...EvaluationCommandHandlers,
    ...EvaluationQueryHandlers,
    ...EvaluationEventHandlers,
  ],
  exports: [EvaluationTaskRepository, EvaluationSetRepository],
})
export class EvaluationModule {}
