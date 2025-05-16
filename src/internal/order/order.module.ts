import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderMapper } from './infrastructure/mappers';
import { OrderRepository } from './infrastructure/repositories';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';
import { LanguagePairModule } from '../language-pair/language-pair.module';
import { QueueModule } from 'src/infrastructure/queue';
import { BullModule } from '@nestjs/bullmq';
import {
  MACHINE_TRANSLATION_FLOW,
  ORDER_QUEUES,
} from './infrastructure/bullmq/constants';

@Module({
  imports: [
    CqrsModule,
    QueueModule,
    LanguagePairModule,
    BullModule.registerFlowProducer({
      name: MACHINE_TRANSLATION_FLOW.name,
    }),
    ...Object.values(ORDER_QUEUES).map((queueName) =>
      BullModule.registerQueue({ name: queueName }),
    ),
  ],
  controllers: [OrderController],
  providers: [OrderMapper, OrderRepository, ...OrderCommandHandlers],
})
export class OrderModule {}
