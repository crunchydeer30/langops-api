interface UserEmailVerificationTokenGeneratedEventProps {
  userId: string;
  token: string;
  at: Date;
}

export class UserEmailVerificationTokenGeneratedEvent {
  constructor(
    public readonly props: UserEmailVerificationTokenGeneratedEventProps,
  ) {}
}
