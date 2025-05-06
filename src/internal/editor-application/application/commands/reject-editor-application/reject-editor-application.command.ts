import { ICommand } from '@nestjs/cqrs';

interface RejectEditorApplicationCommandPayload {
  applicationId: string;
  rejectionReason: string;
}

export class RejectEditorApplicationCommand implements ICommand {
  constructor(public readonly payload: RejectEditorApplicationCommandPayload) {}
}
