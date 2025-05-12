interface IOrderAITranslatedEventProps {
  orderId: string;
  aiTranslatedText: string;
  translatedAt: Date;
}

export class OrderAITranslatedEvent {
  constructor(public readonly payload: IOrderAITranslatedEventProps) {}
}
