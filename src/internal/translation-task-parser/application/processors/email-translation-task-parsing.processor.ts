import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Injectable } from '@nestjs/common';
import { TRANSLATION_TASK_PARSING_QUEUES } from '../../infrastructure/queues/constants';
import { Job } from 'bullmq';

@Injectable()
@Processor(TRANSLATION_TASK_PARSING_QUEUES.EMAIL)
export class EmailTranslationTaskParsingProcessor extends WorkerHost {
  private readonly logger = new Logger(
    EmailTranslationTaskParsingProcessor.name,
  );

  constructor() {
    super();
  }

  async process(job: Job<{ taskId: string }, any>): Promise<any> {
    this.logger.log(`It wll be processed in the future`);
  }
}
