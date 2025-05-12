import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '@common/config';
import { SendEmailCommand } from 'src/integration/email/commands';
import { EditorApplicationApprovedEvent } from 'src/internal/editor-application/domain';

@EventsHandler(EditorApplicationApprovedEvent)
export class EditorApplicationApprovedHandler
  implements IEventHandler<EditorApplicationApprovedEvent>
{
  private readonly logger = new Logger(EditorApplicationApprovedHandler.name);
  private readonly baseUrl: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<Env>,
  ) {
    this.baseUrl = this.configService.getOrThrow('BASE_URL');
  }

  async handle(event: EditorApplicationApprovedEvent): Promise<void> {
    this.logger.log(
      `Registration token generated for application: ${event.payload.applicationId}`,
    );

    try {
      const registrationUrl = `${this.baseUrl}/editor/register?token=${event.payload.plainToken}&applicationId=${event.payload.applicationId}`;

      await this.commandBus.execute(
        new SendEmailCommand({
          to: event.payload.email,
          subject: 'Your Editor Application Has Been Approved!',
          htmlBody: `
            <h1>Your Editor Application Has Been Approved!</h1>
            <p>Congratulations! Your application to become an editor has been approved.</p>
            <p>Please click the button below to complete your registration and set up your account.</p>
            <div style="margin: 20px 0;">
              <a href="${registrationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Registration</a>
            </div>
            <p>This link is unique to you and should not be shared with anyone else.</p>
            <p>If you did not apply to be an editor, please ignore this email.</p>
          `,
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
