interface UserRegisteredEventProps {
  userId: string;
}

export class UserRegisteredEvent {
  constructor(public readonly props: UserRegisteredEventProps) {}
}
