import { IEvent } from '@nestjs/cqrs';

interface IEditorApplicationApprovedEvent {
  applicationId: string;
  email: string;
  plainToken: string;
}

export class EditorApplicationApprovedEvent implements IEvent {
  constructor(public readonly payload: IEditorApplicationApprovedEvent) {}
}
