export interface ICustomerEmailVerificationTokenGeneratedEventProps {
  customerId: string;
  plainToken: string;
}

export class CustomerEmailVerificationTokenGeneratedEvent {
  constructor(
    public readonly payload: ICustomerEmailVerificationTokenGeneratedEventProps,
  ) {}
}
