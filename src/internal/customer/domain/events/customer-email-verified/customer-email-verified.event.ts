interface ICustomerEmailVerifiedEventProps {
  customerId: string;
}

export class CustomerEmailVerifiedEvent {
  constructor(public readonly payload: ICustomerEmailVerifiedEventProps) {}
}
