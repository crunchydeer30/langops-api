import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer } from 'bullmq';

@Injectable()
export class TranslationFlow {
  private readonly logger = new Logger(TranslationFlow.name);

  constructor(
    @InjectFlowProducer('translation-flow')
    private readonly flowProducer: FlowProducer,
  ) {}

  async start(orderId: string) {
    this.logger.log(`Starting translation flow for order: ${orderId}`);

    const flow = await this.flowProducer.add({
      name: `translation-flow-${orderId}`,
      queueName: 'translation-flow-queue',
      children: [
        {
          name: 'translation-flow:translate',
          data: { orderId },
          queueName: 'translation-queue',
        },
      ],
    });

    this.logger.log(`Translation flow "${orderId}" created`);
    return flow;
  }
}
