import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer } from 'bullmq';
import { TRANSLATION_FLOW } from '../../infrastructure/bullmq';

@Injectable()
export class TranslationFlow {
  private readonly logger = new Logger(TranslationFlow.name);

  constructor(
    @InjectFlowProducer(TRANSLATION_FLOW.name)
    private readonly flowProducer: FlowProducer,
  ) {}

  async start(orderId: string) {
    this.logger.log(`Starting translation flow for order: ${orderId}`);

    const flow = await this.flowProducer.add({
      name: `${TRANSLATION_FLOW.name}:${orderId}`,
      queueName: TRANSLATION_FLOW.queue,
      children: [
        {
          name: TRANSLATION_FLOW.JOBS.TRANSLATE.name,
          data: { orderId },
          queueName: TRANSLATION_FLOW.JOBS.TRANSLATE.queue,
          children: [
            {
              name: TRANSLATION_FLOW.JOBS.PARSE.name,
              data: { orderId },
              queueName: TRANSLATION_FLOW.JOBS.PARSE.queue,
            },
          ],
        },
      ],
    });

    this.logger.log(`Translation flow "${orderId}" created`);
    return flow;
  }
}
