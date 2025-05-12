import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from '@common/config';
import { SendEmailCommand } from 'src/integration/email/commands';
import { EditorRegisteredEvent } from 'src/internal/editor/domain/events';

@Injectable()
@EventsHandler(EditorRegisteredEvent)
export class EditorRegisteredHandler
  implements IEventHandler<EditorRegisteredEvent>
{
  private readonly logger = new Logger(EditorRegisteredHandler.name);
  private readonly baseUrl: string;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService<Env>,
  ) {
    this.baseUrl = this.configService.getOrThrow('BASE_URL');
  }

  async handle(event: EditorRegisteredEvent): Promise<void> {
    this.logger.log(
      `Processing editor registration email for editor: ${event.payload.editorId}`,
    );

    try {
      const { email, firstName } = event.payload;
      const loginUrl = `${this.baseUrl}/editor/login`;

      await this.commandBus.execute(
        new SendEmailCommand({
          to: email,
          subject: 'Welcome to the Translation Platform!',
          htmlBody: `
            <h1>Welcome to the Translation Platform, ${firstName}!</h1>
            <p>Thank you for completing your registration as an editor.</p>
            <p>Your account has been successfully created and you can now log in to the platform.</p>
            <div style="margin: 20px 0;">
              <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Login Page</a>
            </div>
            <p>Here's what you can do now:</p>
            <ul>
              <li>Check your assigned language pairs</li>
              <li>Start working on translation assignments</li>
              <li>Update your profile information</li>
            </ul>
            <p>If you have any questions or need assistance, please contact our support team.</p>
            <p>Welcome aboard!</p>
          `,
        }),
      );

      this.logger.log(
        `Welcome email sent successfully to editor: ${event.payload.editorId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending welcome email to editor: ${event.payload.editorId}. Error: ${JSON.stringify(error)}`,
      );
    }
  }
}
