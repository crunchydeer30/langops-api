import { IEvent } from '@nestjs/cqrs';

interface IEditorApplicationRejectedEvent {
  applicationId: string;
  rejectionReason: string;
  email: string;
}

export class EditorApplicationRejectedEvent implements IEvent {
  constructor(public readonly payload: IEditorApplicationRejectedEvent) {}
}
