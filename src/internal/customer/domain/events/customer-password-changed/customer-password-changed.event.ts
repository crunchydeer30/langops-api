interface ICustomerPasswordChangedEventProps {
  customerId: string;
  at: Date;
}

export class CustomerPasswordChangedEvent {
  constructor(public readonly payload: ICustomerPasswordChangedEventProps) {}
}
