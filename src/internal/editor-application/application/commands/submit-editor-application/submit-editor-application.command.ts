import { ICommand } from '@nestjs/cqrs';

export interface SubmitEditorApplicationCommandPayload {
  email: string;
  firstName: string;
  lastName: string;
  languagePairIds: string[];
}

export class SubmitEditorApplicationCommand implements ICommand {
  constructor(public readonly payload: SubmitEditorApplicationCommandPayload) {}
}
