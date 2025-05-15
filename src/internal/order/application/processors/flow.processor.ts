import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MACHINE_TRANSLATION_FLOW } from '../../infrastructure/bullmq/constants';

@Injectable()
@Processor(MACHINE_TRANSLATION_FLOW.queue)
export class MachineTranslationFlowProcessor extends WorkerHost {
  private readonly logger = new Logger(MachineTranslationFlowProcessor.name);

  async process(job: Job<{ orderId: string }>): Promise<void> {
    this.logger.log(
      `[MACHINE TRANSLATION] Flow job processed: ${job.name} (id: ${job.id})`,
    );
    // No additional logic; children will spawn automatically
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Flow job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Flow job ${job.id} failed: ${err.message}`);
  }
}
