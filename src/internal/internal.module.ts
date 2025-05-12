import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { EditorApplicationModule } from './editor-application/editor-application.module';
import { EditorModule } from './editor/editor.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    AuthModule,
    CustomerModule,
    EditorModule,
    EditorApplicationModule,
    OrderModule,
  ],
})
export class InternalModule {}
