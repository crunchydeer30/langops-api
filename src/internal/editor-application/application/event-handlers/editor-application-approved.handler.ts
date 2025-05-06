import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EditorApplicationApprovedEvent } from '../../domain/events/editor-application-approved.event';

@EventsHandler(EditorApplicationApprovedEvent)
export class EditorApplicationApprovedHandler
  implements IEventHandler<EditorApplicationApprovedEvent>
{
  private readonly logger = new Logger(EditorApplicationApprovedHandler.name);

  async handle(event: EditorApplicationApprovedEvent): Promise<void> {
    this.logger.log(
      `Editor application approved: ${event.payload.applicationId}`,
    );
    // TODO: Implement logic for handling editor application approved event
    return new Promise((resolve) => resolve());
  }
}
