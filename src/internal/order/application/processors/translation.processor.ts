import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TRANSLATION_FLOW } from '../../infrastructure/bullmq/constants';

@Processor(TRANSLATION_FLOW.JOBS.TRANSLATE.queue)
export class TranslationProcessor extends WorkerHost {
  private readonly logger = new Logger(TranslationProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.debug(
      `${TranslationProcessor.name} received job: ${JSON.stringify(job)}`,
    );

    switch (job.name) {
      case TRANSLATION_FLOW.JOBS.TRANSLATE.name:
        this.logger.warn('TRANSLATED');
        return;
      default:
        this.logger.error(
          `No handler found for processing job ${JSON.stringify(job)}`,
        );
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} started`);
  }
}
