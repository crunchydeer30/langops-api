import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TaskCreatedEvent } from '../../../translation-task/domain/events';
import { TranslationTaskProcessingOrchestrator } from '../flows/translation-task-processing.orchestrator';

@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
  private readonly logger = new Logger(TaskCreatedHandler.name);

  constructor(
    private readonly orchestrator: TranslationTaskProcessingOrchestrator,
  ) {}

  async handle(event: TaskCreatedEvent): Promise<void> {
    try {
      this.logger.log(
        `Handling TaskCreatedEvent for task ${event.payload.taskId} of type ${event.payload.taskType}`,
      );

      await this.orchestrator.startParsingFlow(
        event.payload.taskId,
        event.payload.taskType,
      );
    } catch (error) {
      this.logger.error(
        `Error handling TaskCreatedEvent for task ${event.payload.taskId}: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
    }
  }
}
