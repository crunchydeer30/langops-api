import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderMapper } from './infrastructure/mappers';
import { OrderRepository } from './infrastructure/repositories';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';
import { QueueModule } from 'src/infrastructure/queue';
import { LanguageModule } from '../language/language.module';

@Module({
  imports: [CqrsModule, QueueModule, LanguageModule],
  controllers: [OrderController],
  providers: [OrderMapper, OrderRepository, ...OrderCommandHandlers],
})
export class OrderModule {}
