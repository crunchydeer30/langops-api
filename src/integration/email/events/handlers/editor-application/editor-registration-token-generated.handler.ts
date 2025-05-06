import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '@common/config';
import { SendEmailCommand } from 'src/integration/email/commands';
import { EditorRegistrationTokenGeneratedEvent } from 'src/internal/editor-application/domain';

@EventsHandler(EditorRegistrationTokenGeneratedEvent)
export class EditorRegistrationTokenGeneratedHandler
  implements IEventHandler<EditorRegistrationTokenGeneratedEvent>
{
  private readonly logger = new Logger(
    EditorRegistrationTokenGeneratedHandler.name,
  );
  private readonly baseUrl: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<Env>,
  ) {
    this.baseUrl = this.configService.getOrThrow('BASE_URL');
  }

  async handle(event: EditorRegistrationTokenGeneratedEvent): Promise<void> {
    this.logger.log(
      `Registration token generated for application: ${event.payload.applicationId}`,
    );

    try {
      const registrationUrl = `${this.baseUrl}/editor/register?token=${event.payload.plainToken}`;

      await this.commandBus.execute(
        new SendEmailCommand({
          to: event.payload.email,
          subject: 'Your Editor Application Has Been Approved!',
          htmlBody: `Your editor application has been approved. Please use the link below to register: ${registrationUrl}`,
        }),
      );

      this.logger.log(
        `Registration invitation email sent to: ${event.payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending registration invitation email: ${JSON.stringify(error)}`,
      );
    }
  }
}
