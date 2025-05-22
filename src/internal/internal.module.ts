import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { EditorApplicationModule } from './editor-application/editor-application.module';
import { EditorModule } from './editor/editor.module';
import { OrderModule } from './order/order.module';
import { LanguageModule } from './language/language.module';
import { StaffModule } from './staff/staff.module';
import { TranslationTaskModule } from './translation-task/translation.module';
import { TranslationTaskProcessingModule } from './translation-task-processing/translation-task-processing.module';
import { MachineTranslationModule } from './machine-translation/machine-translation.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    EditorModule,
    EditorApplicationModule,
    LanguageModule,
    MachineTranslationModule,
    OrderModule,
    StaffModule,
    TranslationTaskModule,
    TranslationTaskProcessingModule,
  ],
})
export class InternalModule {}
