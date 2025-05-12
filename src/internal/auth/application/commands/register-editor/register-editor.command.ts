import { ICommand } from '@nestjs/cqrs';

export interface IRegisterEditorCommandProps {
  token: string;
  applicationId: string;
  password: string;
}

export interface IRegisterEditorCommandResult {
  userId: string;
  accessToken: string;
}

export class RegisterEditorCommand implements ICommand {
  constructor(public readonly props: IRegisterEditorCommandProps) {}
}
