interface AuthenticateUserCommandProps {
  email: string;
  passwordPlain: string;
}

export class AuthenticateUserCommand {
  constructor(public readonly props: AuthenticateUserCommandProps) {}
}
