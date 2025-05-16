import { OrderType } from '@prisma/client';

export interface IOrderCreatedEventProps {
  orderId: string;
  customerId: string;
  languagePairId: string;
  sourceContent: string;
  type: OrderType;
  taskSpecificInstructions?: string | null;
  createdAt: Date;
}

export class OrderCreatedEvent {
  constructor(public readonly payload: IOrderCreatedEventProps) {}
}
