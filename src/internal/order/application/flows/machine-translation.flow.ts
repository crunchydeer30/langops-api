import { InjectFlowProducer } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FlowProducer } from 'bullmq';
import { MACHINE_TRANSLATION_FLOW } from '../../infrastructure/bullmq/constants';

@Injectable()
export class MachineTranslationFlow {
  private readonly logger = new Logger(MachineTranslationFlow.name);

  constructor(
    @InjectFlowProducer(MACHINE_TRANSLATION_FLOW.name)
    private readonly flowProducer: FlowProducer,
  ) {}

  async start(orderId: string) {
    this.logger.log(
      `[MACHINE TRANSLATION] Starting machine translation workflow for order ID: ${orderId}`,
    );

    const flow = await this.flowProducer.add({
      name: `${MACHINE_TRANSLATION_FLOW.name}:${orderId}`,
      queueName: MACHINE_TRANSLATION_FLOW.queue,
      children: [
        {
          name: MACHINE_TRANSLATION_FLOW.JOBS.PARSE.name,
          data: { orderId },
          queueName: MACHINE_TRANSLATION_FLOW.JOBS.PARSE.queue,
          children: [
            {
              name: MACHINE_TRANSLATION_FLOW.JOBS.SEGMENT_TEXT.name,
              data: { orderId },
              queueName: MACHINE_TRANSLATION_FLOW.JOBS.SEGMENT_TEXT.queue,
              children: [
                {
                  name: MACHINE_TRANSLATION_FLOW.JOBS.MASK.name,
                  data: { orderId },
                  queueName: MACHINE_TRANSLATION_FLOW.JOBS.MASK.queue,
                },
              ],
            },
          ],
        },
      ],
    });

    this.logger.log(
      `[MACHINE TRANSLATION] Workflow created for order ID: ${orderId}`,
    );
    this.logger.log(`[MACHINE TRANSLATION] Flow ID: ${flow.job.id}`);
    return flow;
  }
}
