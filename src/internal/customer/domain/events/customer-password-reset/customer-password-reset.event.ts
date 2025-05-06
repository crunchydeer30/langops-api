export class CustomerPasswordResetEvent {
  constructor(public readonly payload: { customerId: string }) {}
}
