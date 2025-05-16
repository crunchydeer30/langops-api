import { Injectable } from '@nestjs/common';
import { Order as OrderModel } from '@prisma/client';
import { Order, IOrder } from '../../domain/entities/order.entity';

@Injectable()
export class OrderMapper {
  toDomain(model: OrderModel): Order {
    const props: IOrder = {
      id: model.id,
      customerId: model.customerId,
      languagePairId: model.languagePairId,
      originalText: model.originalText,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
    return new Order(props);
  }

  toPersistence(
    entity: Order,
  ): Omit<OrderModel, 'createdAt' | 'updatedAt'> &
    Partial<Pick<OrderModel, 'createdAt' | 'updatedAt'>> {
    return {
      id: entity.id,
      customerId: entity.customerId,
      languagePairId: entity.languagePairId,
      originalText: entity.originalText,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
