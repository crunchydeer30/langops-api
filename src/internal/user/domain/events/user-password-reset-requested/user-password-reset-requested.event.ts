interface UserPasswordResetRequestedEventProps {
  userId: string;
  token: string;
  at: Date;
}

export class UserPasswordResetRequestedEvent {
  constructor(public readonly props: UserPasswordResetRequestedEventProps) {}
}
