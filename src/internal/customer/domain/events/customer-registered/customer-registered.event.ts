interface ICustomerRegisteredEventProps {
  customerId: string;
}

export class CustomerRegisteredEvent {
  constructor(public readonly payload: ICustomerRegisteredEventProps) {}
}
