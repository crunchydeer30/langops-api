export interface IOrderCreatedEventProps {
  orderId: string;
  clientId: string;
  languagePairId: string;
  originalText: string;
  taskSpecificInstructions?: string | null;
  createdAt: Date;
}

export class OrderCreatedEvent {
  constructor(public readonly payload: IOrderCreatedEventProps) {}
}
