import { Processor, WorkerHost } from '@nestjs/bullmq';
import { TRANSLATION_TASK_PROCESSING_QUEUE } from '../../infrastructure/queues';
import { Job } from 'bullmq';
import { TranslationTaskType } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessHTMLTaskCommand } from '../commands/process-html-task/process-html-task.command';

// TODO: set up backoff strategy
@Processor(TRANSLATION_TASK_PROCESSING_QUEUE, {})
export class TranslationTaskProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(TranslationTaskProcessingProcessor.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(
    job: Job<{ taskId: string; taskType: TranslationTaskType }, any, string>,
  ): Promise<any> {
    await this.handleProcessing(job.data.taskId);
  }

  private async handleProcessing(taskId: string) {
    try {
      // TODO: Add support for other content types
      this.logger.debug(`Start processing translation task ${taskId}`);
      await this.commandBus.execute<ProcessHTMLTaskCommand>(
        new ProcessHTMLTaskCommand({ taskId }),
      );
    } catch (e) {
      console.log(e);
      this.logger.error(
        `Error during translation task ${taskId} processing: ${JSON.stringify(e)}`,
      );
      throw e;
    }
  }
}
