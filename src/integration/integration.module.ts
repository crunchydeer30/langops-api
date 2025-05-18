import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { DeeplModule } from './deepl/deepl.module';

@Module({
  imports: [DeeplModule, EmailModule],
})
export class IntegrationModule {}
