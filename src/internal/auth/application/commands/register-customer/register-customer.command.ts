import { ICommand } from '@nestjs/cqrs';

export interface IRegisterCustomerCommandProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IRegisterCustomerCommandResult {
  userId: string;
  accessToken: string;
}

export class RegisterCustomerCommand implements ICommand {
  constructor(public readonly props: IRegisterCustomerCommandProps) {}
}
