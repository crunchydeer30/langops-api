import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { EditorApplicationModule } from './editor-application/editor-application.module';
import { EditorModule } from './editor/editor.module';
import { OrderModule } from './order/order.module';
import { LanguageModule } from './language/language.module';
import { LanguagePairModule } from './language-pair/language-pair.module';
import { StaffModule } from './staff/staff.module';
import { TranslationModule } from './translation/translation.module';
import { TranslationTaskParsingModule } from './translation-task-parsing/translation-task-parsing.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    EditorModule,
    EditorApplicationModule,
    LanguageModule,
    LanguagePairModule,
    OrderModule,
    StaffModule,
    TranslationTaskParsingModule,
    TranslationModule,
  ],
})
export class InternalModule {}
