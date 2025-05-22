import { Global, Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { DeeplModule } from './deepl/deepl.module';
import { AnonymizerModule } from './anonymizer/anonymizer.module';

@Global()
@Module({
  imports: [AnonymizerModule, DeeplModule, EmailModule],
})
export class IntegrationModule {}
