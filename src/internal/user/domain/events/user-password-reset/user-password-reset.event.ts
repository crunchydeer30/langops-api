interface UserPasswordResetEventProps {
  userId: string;
  at: Date;
}

export class UserPasswordResetEvent {
  constructor(public readonly props: UserPasswordResetEventProps) {}
}
