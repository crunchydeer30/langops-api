import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SendEmailCommand } from './send-email.command';
import { IEmailService } from '../../services';

@CommandHandler(SendEmailCommand)
export class SendEmailHandler implements ICommandHandler<SendEmailCommand> {
  private readonly logger = new Logger(SendEmailHandler.name);

  constructor(
    @Inject(IEmailService) private readonly emailService: IEmailService,
  ) {}

  async execute({ props }: SendEmailCommand): Promise<void> {
    const toRecipients = Array.isArray(props.to)
      ? props.to.join(', ')
      : props.to;
    this.logger.log(
      `Attempting to send email to: ${toRecipients} with subject: ${props.subject}`,
    );
    await this.emailService.send(props);
    this.logger.log(`Successfully initiated email sending to: ${toRecipients}`);
  }
}
