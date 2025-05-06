interface ICustomerRegisteredEventProps {
  customerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export class CustomerRegisteredEvent {
  constructor(public readonly payload: ICustomerRegisteredEventProps) {}
}
