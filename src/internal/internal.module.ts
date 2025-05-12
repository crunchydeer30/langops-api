import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { EditorApplicationModule } from './editor-application/editor-application.module';
import { EditorModule } from './editor/editor.module';
import { OrderModule } from './order/order.module';
import { LanguageModule } from './language/language.module';
import { LanguagePairModule } from './language-pair/language-pair.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    EditorModule,
    EditorApplicationModule,
    LanguageModule,
    LanguagePairModule,
    OrderModule,
  ],
})
export class InternalModule {}
