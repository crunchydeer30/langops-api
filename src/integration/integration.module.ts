import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { EmailEventHandlers } from './email/events';

@Module({
  imports: [EmailModule],
  providers: [...EmailEventHandlers],
  exports: [],
})
export class IntegrationModule {}
