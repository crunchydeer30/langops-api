import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MACHINE_TRANSLATION_FLOW } from '../../infrastructure/bullmq/constants';
import { TextSegmentationService } from '../services/text-segmentation.service';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';

@Injectable()
@Processor(MACHINE_TRANSLATION_FLOW.JOBS.PARSE.queue)
export class OrderParserProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderParserProcessor.name);

  constructor(
    private readonly textSegmentationService: TextSegmentationService,
    private readonly orderRepository: OrderRepository,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    this.logger.debug(
      `[MACHINE TRANSLATION] Processing job: ${job.name} with id: ${job.id}`,
    );
    const { orderId } = job.data;

    switch (job.name) {
      case MACHINE_TRANSLATION_FLOW.JOBS.PARSE.name: {
        this.logger.log(
          `[MACHINE TRANSLATION] Finished parsing for order: ${orderId}`,
        );
        return;
      }

      case MACHINE_TRANSLATION_FLOW.JOBS.SEGMENT_TEXT.name: {
        this.logger.log(
          `[MACHINE TRANSLATION] Segmenting original text for order: ${orderId}`,
        );

        const order = await this.orderRepository.findById(orderId);

        if (!order) {
          this.logger.error(
            `[MACHINE TRANSLATION] Error occurred during segmenting. Order "${orderId}" not found`,
          );
          throw new Error(`Order not found: ${orderId}`);
        }

        const segments =
          await this.textSegmentationService.segmentOrderText(orderId);

        this.logger.log(
          `[MACHINE TRANSLATION] Text segmentation completed for order: ${orderId}. Created ${segments.length} segments.`,
        );
        return;
      }

      default:
        this.logger.error(`Unknown job name: ${job.name}`);
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.debug(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );
  }
}
