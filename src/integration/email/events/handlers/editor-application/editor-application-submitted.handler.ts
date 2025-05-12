import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EditorApplicationSubmittedEvent } from 'src/internal/editor-application/domain/events/editor-application-submitted.event';
import { SendEmailCommand } from 'src/integration/email/commands';

@EventsHandler(EditorApplicationSubmittedEvent)
export class EditorApplicationSubmittedHandler
  implements IEventHandler<EditorApplicationSubmittedEvent>
{
  private readonly logger = new Logger(EditorApplicationSubmittedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EditorApplicationSubmittedEvent): Promise<void> {
    const { applicationId, email, languagePairIds } = event.payload;

    this.logger.log(
      `Processing editor application submission notification: ${applicationId}`,
    );

    try {
      await this.commandBus.execute(
        new SendEmailCommand({
          to: email,
          subject: 'Your Editor Application Has Been Received',
          htmlBody: `
            <h1>Thank You for Your Application!</h1>
            <p>Dear Applicant,</p>
            <p>We have received your application to become an editor for our translation platform.</p>
            <p>Your application ID is: <strong>${applicationId}</strong></p>
            <p>You have applied to work with ${languagePairIds.length} language pair(s).</p>
            <p>Our team will review your application shortly. You will receive another email once your application has been processed.</p>
            <p>Thank you for your interest in joining our platform!</p>
            <p>Best regards,<br>The Translation Team</p>
          `,
        }),
      );

      this.logger.log(`Application confirmation email sent to: ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send application confirmation email: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      );
    }
  }
}
