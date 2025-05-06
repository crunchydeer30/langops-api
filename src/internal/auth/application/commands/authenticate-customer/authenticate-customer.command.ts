interface AuthenticateCustomerProps {
  email: string;
  password: string;
}

export class AuthenticateCustomerCommand {
  constructor(public readonly props: AuthenticateCustomerProps) {}
}
