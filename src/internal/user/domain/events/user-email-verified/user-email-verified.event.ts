interface IUserEmailVerifiedEvent {
  userId: string;
  at: Date;
}

export class UserEmailVerifiedEvent {
  constructor(public readonly props: IUserEmailVerifiedEvent) {}
}
