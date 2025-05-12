import { ICommand } from '@nestjs/cqrs';

export interface IApproveEditorApplicationCommandProps {
  applicationId: string;
}

export interface IApproveEditorApplicationCommandResult {
  success: boolean;
  editorId?: string;
}

export class ApproveEditorApplicationCommand implements ICommand {
  constructor(public readonly props: IApproveEditorApplicationCommandProps) {}
}
