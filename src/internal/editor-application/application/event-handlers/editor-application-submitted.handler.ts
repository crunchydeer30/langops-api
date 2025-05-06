import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EditorApplicationSubmittedEvent } from '../../domain/events/editor-application-submitted.event';

@EventsHandler(EditorApplicationSubmittedEvent)
export class EditorApplicationSubmittedHandler
  implements IEventHandler<EditorApplicationSubmittedEvent>
{
  private readonly logger = new Logger(EditorApplicationSubmittedHandler.name);

  async handle(event: EditorApplicationSubmittedEvent): Promise<void> {
    this.logger.log(
      `Editor application submitted: ${event.payload.applicationId} by ${event.payload.email}`,
    );
    // TODO: Implement logic for handling editor application submitted event
    return new Promise((resolve) => resolve());
  }
}
