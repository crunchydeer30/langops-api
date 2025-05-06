import { IEvent } from '@nestjs/cqrs';

interface IEditorApplicationApprovedEvent {
  applicationId: string;
}

export class EditorApplicationApprovedEvent implements IEvent {
  constructor(public readonly payload: IEditorApplicationApprovedEvent) {}
}
