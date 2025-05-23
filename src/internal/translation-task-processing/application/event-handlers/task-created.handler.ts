import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { TaskCreatedEvent } from '../../../translation-task/domain/events';
import { InjectQueue } from '@nestjs/bullmq';
import { TRANSLATION_TASK_PROCESSING_QUEUE } from '../../infrastructure/queues';
import { Queue } from 'bullmq';

@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
  private readonly logger = new Logger(TaskCreatedHandler.name);

  constructor(
    @InjectQueue(TRANSLATION_TASK_PROCESSING_QUEUE)
    private readonly queue: Queue,
  ) {}

  async handle(event: TaskCreatedEvent): Promise<void> {
    try {
      this.logger.debug(
        `Task ${event.payload.taskId} is created adding to processing queue`,
      );

      await this.queue.add('process', {
        taskId: event.payload.taskId,
        taskType: event.payload.taskType,
      });

      this.logger.debug(
        `Added task ${event.payload.taskId} into processing queue`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to put task ${event.payload.taskId} into processing queue: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`,
      );
    }
  }
}
