import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  OrderMapper,
  TranslationSegmentMapper,
} from './infrastructure/mappers';
import {
  OrderRepository,
  SensitiveDataMappingRepository,
  TranslationSegmentRepository,
} from './infrastructure/repositories';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';
import {
  TextSegmentationService,
  SensitiveDataMaskingService,
} from './application/services';
import { LanguagePairModule } from '../language-pair/language-pair.module';
import { QueueModule } from 'src/infrastructure/queue';
import { MachineTranslationFlow } from './application/flows';
import { BullModule } from '@nestjs/bullmq';
import {
  OrderParserProcessor,
  MaskSensitiveDataProcessor,
  SegmentTextProcessor,
} from './application/processors';
import {
  MACHINE_TRANSLATION_FLOW,
  ORDER_QUEUES,
} from './infrastructure/bullmq/constants';
import { SensitiveDataMappingMapper } from './infrastructure/mappers/sensitive-data-mapping.mapper';

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
  providers: [
    OrderMapper,
    OrderRepository,
    TranslationSegmentMapper,
    TranslationSegmentRepository,
    SensitiveDataMappingMapper,
    SensitiveDataMappingRepository,
    TextSegmentationService,
    SensitiveDataMaskingService,
    MachineTranslationFlow,
    OrderParserProcessor,
    MaskSensitiveDataProcessor,
    SegmentTextProcessor,
    ...OrderCommandHandlers,
  ],
})
export class OrderModule {}
