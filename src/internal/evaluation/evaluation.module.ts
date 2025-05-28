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
import { EvaluationEventHandlers } from './application/events/handlers';
import { EvaluationController } from './application/controllers';
import { EditorModule } from '../editor/editor.module';
import { LanguageModule } from '../language/language.module';
import { SampleEvaluationContentModule } from '../sample-evaluation-content/sample-evaluation-content.module';
import { TranslationTaskModule } from '../translation-task/translation-task.module';

@Module({
  imports: [
    CqrsModule,
    EditorModule,
    LanguageModule,
    SampleEvaluationContentModule,
    TranslationTaskModule,
  ],
  controllers: [EvaluationController],
  providers: [
    EvaluationTaskRepository,
    EvaluationTaskMapper,
    EvaluationSetRepository,
    EvaluationSetMapper,
    ...EvaluationCommandHandlers,
    ...EvaluationEventHandlers,
  ],
  exports: [EvaluationTaskRepository, EvaluationSetRepository],
})
export class EvaluationModule {}
