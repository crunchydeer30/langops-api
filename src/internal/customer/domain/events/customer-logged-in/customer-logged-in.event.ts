interface ICustomerLoggedInEventProps {
  customerId: string;
  at: Date;
}

export class CustomerLoggedInEvent {
  constructor(public readonly payload: ICustomerLoggedInEventProps) {}
}
