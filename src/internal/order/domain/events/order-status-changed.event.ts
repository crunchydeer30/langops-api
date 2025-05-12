import { OrderStatus } from '@prisma/client';

interface IOrderStatusChangedEventProps {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: Date;
}

export class OrderStatusChangedEvent {
  constructor(public readonly payload: IOrderStatusChangedEventProps) {}
}
