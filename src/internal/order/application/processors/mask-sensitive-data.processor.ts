import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MACHINE_TRANSLATION_FLOW } from '../../infrastructure/bullmq/constants/machine-translation.constants';
import { SensitiveDataMaskingService } from '../services/sensitive-data-masking.service';
import { OrderRepository } from '../../infrastructure/repositories/order.repository';

@Injectable()
@Processor(MACHINE_TRANSLATION_FLOW.JOBS.MASK.queue)
export class MaskSensitiveDataProcessor extends WorkerHost {
  private readonly logger = new Logger(MaskSensitiveDataProcessor.name);

  constructor(
    private readonly maskingService: SensitiveDataMaskingService,
    private readonly orderRepository: OrderRepository,
  ) {
    super();
  }

  async process(job: Job<{ orderId: string }>): Promise<void> {
    const { orderId } = job.data;
    this.logger.log(
      `[MACHINE TRANSLATION] Masking sensitive data for order: ${orderId}`,
    );

    // Get masked text from service
    const { maskedText } = await this.maskingService.maskText(orderId);

    // Save masked text back to the order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.error(`[MACHINE TRANSLATION] Order not found: ${orderId}`);
      throw new Error(`Order not found: ${orderId}`);
    }

    order.maskedText = maskedText;
    await this.orderRepository.save(order);
    this.logger.log(
      `[MACHINE TRANSLATION] Saved masked text for order: ${orderId}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Mask job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Mask job ${job.id} failed: ${err.message}`);
  }
}
