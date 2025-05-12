import { ICommand } from '@nestjs/cqrs';

export interface IAuthenticateEditorCommandProps {
  email: string;
  password: string;
}

export interface IAuthenticateEditorCommandResult {
  accessToken: string;
}

export class AuthenticateEditorCommand implements ICommand {
  constructor(public readonly props: IAuthenticateEditorCommandProps) {}
}
