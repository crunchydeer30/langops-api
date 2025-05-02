interface UserLoggedInEventProps {
  userId: string;
  at: Date;
}

export class UserLoggedInEvent {
  constructor(public readonly props: UserLoggedInEventProps) {}
}
