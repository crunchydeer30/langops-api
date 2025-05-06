import { ICommand } from '@nestjs/cqrs';

interface ApproveEditorApplicationCommandPayload {
  applicationId: string;
}

export class ApproveEditorApplicationCommand implements ICommand {
  constructor(
    public readonly payload: ApproveEditorApplicationCommandPayload,
  ) {}
}
