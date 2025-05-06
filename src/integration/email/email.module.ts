import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IEmailService, MailhogEmailService } from './services';
import { SendEmailHandler } from './commands';

export const CommandHandlers = [SendEmailHandler];

@Global()
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
    ...CommandHandlers,
  ],
  exports: [IEmailService, CqrsModule],
})
export class EmailModule {}
