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

@Module({
  imports: [
    CqrsModule,
    QueueModule,
    LanguagePairModule,
    BullModule.registerQueue({
      name: 'translation-queue',
    }),
    BullModule.registerQueue({
      name: 'translation-flow-queue',
    }),
    BullModule.registerFlowProducer({
      name: 'translation-flow',
    }),
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
