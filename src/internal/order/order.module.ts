import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  OrderMapper,
  TranslationSegmentMapper,
} from './infrastructure/mappers';
import {
  OrderRepository,
  TranslationSegmentRepository,
} from './infrastructure/repositories';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';
import { TextSegmentationService } from './application/services';
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
    TranslationSegmentMapper,
    TranslationSegmentRepository,
    TextSegmentationService,
    TranslationFlow,
    TranslationProcessor,
    ...OrderCommandHandlers,
  ],
})
export class OrderModule {}
