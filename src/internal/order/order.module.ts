import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderMapper } from './infrastructure/mappers/order.mapper';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';
import { LanguagePairModule } from '../language-pair/language-pair.module';
import { QueueModule } from 'src/infrastructure/queue';
import { TranslationFlow } from './application/flows';
import { BullModule } from '@nestjs/bullmq';
import { TranslationProcessor } from './application/processors';
import {
  ORDER_QUEUES,
  TRANSLATION_FLOW,
} from './infrastructure/bullmq/constants';

@Module({
  imports: [
    CqrsModule,
    QueueModule,
    LanguagePairModule,
    BullModule.registerFlowProducer({
      name: TRANSLATION_FLOW.name,
    }),
    ...Object.values(ORDER_QUEUES).map((queueName) =>
      BullModule.registerQueue({ name: queueName }),
    ),
  ],
  controllers: [OrderController],
  providers: [
    OrderMapper,
    OrderRepository,
    TranslationFlow,
    TranslationProcessor,
    ...OrderCommandHandlers,
  ],
})
export class OrderModule {}
