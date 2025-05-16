import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderMapper } from './infrastructure/mappers';
import { OrderRepository } from './infrastructure/repositories';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';
import { LanguagePairModule } from '../language-pair/language-pair.module';
import { QueueModule } from 'src/infrastructure/queue';

@Module({
  imports: [CqrsModule, QueueModule, LanguagePairModule],
  controllers: [OrderController],
  providers: [OrderMapper, OrderRepository, ...OrderCommandHandlers],
})
export class OrderModule {}
