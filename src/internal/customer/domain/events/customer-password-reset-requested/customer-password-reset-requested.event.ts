export interface ICustomerPasswordResetRequestedEventProps {
  customerId: string;
  plainToken: string;
}

export class CustomerPasswordResetRequestedEvent {
  constructor(
    public readonly payload: ICustomerPasswordResetRequestedEventProps,
  ) {}
}
