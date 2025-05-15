import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MACHINE_TRANSLATION_FLOW } from '../../infrastructure/bullmq/constants/machine-translation.constants';
import { TextSegmentationService } from '../services/text-segmentation.service';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@Processor(MACHINE_TRANSLATION_FLOW.JOBS.SEGMENT_TEXT.queue)
export class SegmentTextProcessor extends WorkerHost {
  private readonly logger = new Logger(SegmentTextProcessor.name);

  constructor(
    private readonly textSegmentationService: TextSegmentationService,
    private readonly orderRepository: OrderRepository,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(
      `[MACHINE TRANSLATION] Segmenting text for order: ${orderId}`,
    );

    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.error(
        `[MACHINE TRANSLATION] Cannot segment: order ${orderId} not found`,
      );
      throw new Error(`Order not found: ${orderId}`);
    }

    const segments =
      await this.textSegmentationService.segmentOrderText(orderId);

    this.logger.log(
      `[MACHINE TRANSLATION] Text segmentation completed for order: ${orderId}. Created ${segments.length} segments.`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Segment job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Segment job ${job.id} failed: ${err.message}`);
  }
}
