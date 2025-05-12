import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderMapper } from './infrastructure/mappers/order.mapper';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { OrderController } from './application/controllers/order.controller';
import { OrderCommandHandlers } from './application';

@Module({
  imports: [CqrsModule],
  controllers: [OrderController],
  providers: [OrderMapper, OrderRepository, ...OrderCommandHandlers],
})
export class OrderModule {}
