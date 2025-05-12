import { ICommand } from '@nestjs/cqrs';

export interface ISubmitEditorApplicationCommandProps {
  email: string;
  firstName: string;
  lastName: string;
  languagePairIds: string[];
}

export interface ISubmitEditorApplicationCommandResult {
  id: string;
  email: string;
  status: string;
}

export class SubmitEditorApplicationCommand implements ICommand {
  constructor(public readonly props: ISubmitEditorApplicationCommandProps) {}
}
