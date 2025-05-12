interface IOrderCreatedEventProps {
  orderId: string;
  clientId: string;
  languagePairId: string;
  originalText: string;
  createdAt: Date;
}

export class OrderCreatedEvent {
  constructor(public readonly payload: IOrderCreatedEventProps) {}
}
