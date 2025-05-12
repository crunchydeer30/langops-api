import { ICommand } from '@nestjs/cqrs';

export interface IRejectEditorApplicationCommandProps {
  applicationId: string;
  rejectionReason: string;
}

export interface IRejectEditorApplicationCommandResult {
  success: boolean;
  applicationId: string;
}

export class RejectEditorApplicationCommand implements ICommand {
  constructor(public readonly props: IRejectEditorApplicationCommandProps) {}
}
