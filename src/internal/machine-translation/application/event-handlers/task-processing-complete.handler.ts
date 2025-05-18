import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TaskProcessingCompletedEvent } from '../../../translation-task/domain/events';
import {
  MACHINE_TRANSLATION_QUEUE,
  MACHINE_TRANSLATION_JOBS,
} from '../../infrastructure/bullmq/constants';

@EventsHandler(TaskProcessingCompletedEvent)
export class TaskProcessingCompleteHandler
  implements IEventHandler<TaskProcessingCompletedEvent>
{
  private readonly logger = new Logger(TaskProcessingCompleteHandler.name);

  constructor(
    @InjectQueue(MACHINE_TRANSLATION_QUEUE)
    private readonly machineTranslationQueue: Queue,
  ) {}

  async handle(event: TaskProcessingCompletedEvent): Promise<void> {
    const { taskId } = event.payload;

    this.logger.log(`Enqueueing task ${taskId} for machine translation`);

    await this.machineTranslationQueue.add(
      MACHINE_TRANSLATION_JOBS.TRANSLATE.name,
      { taskId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
  }
}
