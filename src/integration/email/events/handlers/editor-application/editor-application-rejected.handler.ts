import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EditorApplicationRejectedEvent } from 'src/internal/editor-application/domain';
import { SendEmailCommand } from 'src/integration/email/commands';

@EventsHandler(EditorApplicationRejectedEvent)
export class EditorApplicationRejectedHandler
  implements IEventHandler<EditorApplicationRejectedEvent>
{
  private readonly logger = new Logger(EditorApplicationRejectedHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: EditorApplicationRejectedEvent): Promise<void> {
    this.logger.log(
      `Editor application rejected: ${event.payload.applicationId} - Reason: ${event.payload.rejectionReason}`,
    );

    try {
      await this.commandBus.execute(
        new SendEmailCommand({
          to: event.payload.email,
          subject: 'Regarding Your Editor Application',
          htmlBody: `Your editor application has been rejected. Reason: ${event.payload.rejectionReason}`,
        }),
      );

      this.logger.log(`Rejection email sent to: ${event.payload.email}`);
    } catch (error) {
      this.logger.error(
        `Error sending rejection email: ${JSON.stringify(error)}`,
      );
    }
  }
}
