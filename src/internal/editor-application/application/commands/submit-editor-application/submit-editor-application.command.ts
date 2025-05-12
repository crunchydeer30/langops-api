import { ICommand } from '@nestjs/cqrs';

export interface ISubmitEditorApplicationCommandPayload {
  email: string;
  firstName: string;
  lastName: string;
  languagePairIds: string[];
}

export class SubmitEditorApplicationCommand implements ICommand {
  constructor(
    public readonly payload: ISubmitEditorApplicationCommandPayload,
  ) {}
}
