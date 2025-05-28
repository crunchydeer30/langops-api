import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { EditorApplicationModule } from './editor-application/editor-application.module';
import { EditorModule } from './editor/editor.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { LanguageModule } from './language/language.module';
import { StaffModule } from './staff/staff.module';
import { TranslationTaskModule } from './translation-task/translation-task.module';
import { TranslationTaskProcessingModule } from './translation-task-processing/translation-task-processing.module';
import { MachineTranslationModule } from './machine-translation/machine-translation.module';
import { TranslationModule } from './translation/translation.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    EditorModule,
    EditorApplicationModule,
    EvaluationModule,
    LanguageModule,
    MachineTranslationModule,
    StaffModule,
    TranslationModule,
    TranslationTaskModule,
    TranslationTaskProcessingModule,
  ],
})
export class InternalModule {}
