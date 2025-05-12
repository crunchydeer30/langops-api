import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IEmailService, MailhogEmailService } from './services';
import { EmailEventHandlers } from './events';
import { EmailCommandHandlers } from './commands';

@Module({
  imports: [CqrsModule, ConfigModule],
  providers: [
    {
      provide: IEmailService,
      useFactory: (configService: ConfigService) => {
        return new MailhogEmailService(configService);
      },
      inject: [ConfigService],
    },
    ...EmailEventHandlers,
    ...EmailCommandHandlers,
  ],
  exports: [IEmailService, CqrsModule],
})
export class EmailModule {}
