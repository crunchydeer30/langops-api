import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { DeeplModule } from './deepl/deepl.module';
import { AnonymizerModule } from './anonymizer/anonymizer.module';

@Module({
  imports: [AnonymizerModule, DeeplModule, EmailModule],
})
export class IntegrationModule {}
