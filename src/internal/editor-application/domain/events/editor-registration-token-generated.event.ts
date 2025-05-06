import { IEvent } from '@nestjs/cqrs';

interface IEditorRegistrationTokenGeneratedEvent {
  applicationId: string;
  plainToken: string;
  email: string;
}

export class EditorRegistrationTokenGeneratedEvent implements IEvent {
  constructor(
    public readonly payload: IEditorRegistrationTokenGeneratedEvent,
  ) {}
}
