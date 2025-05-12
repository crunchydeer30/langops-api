import { ICommand } from '@nestjs/cqrs';

export interface IAuthenticateStaffCommandProps {
  email: string;
  password: string;
}

export class AuthenticateStaffCommand implements ICommand {
  constructor(public readonly props: IAuthenticateStaffCommandProps) {}
}
