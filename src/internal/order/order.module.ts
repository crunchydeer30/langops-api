import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderMapper } from './infrastructure/mappers/order.mapper';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { IOrderRepository } from './domain/ports/order.repository';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [OrderMapper, OrderRepository],
  exports: [IOrderRepository],
})
export class OrderModule {}
