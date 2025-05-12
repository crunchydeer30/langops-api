import { ICommand } from '@nestjs/cqrs';

export interface IAuthenticateCustomerCommandProps {
  email: string;
  password: string;
}

export interface IAuthenticateCustomerCommandResult {
  accessToken: string;
}

export class AuthenticateCustomerCommand implements ICommand {
  constructor(public readonly props: IAuthenticateCustomerCommandProps) {}
}
