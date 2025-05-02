interface UserPasswordChangedEventProps {
  userId: string;
  at: Date;
}

export class UserPasswordChangedEvent {
  constructor(public readonly props: UserPasswordChangedEventProps) {}
}
