import { IEvent } from '@nestjs/cqrs';

interface IEditorApplicationSubmittedEvent {
  applicationId: string;
  email: string;
  languagePairIds: string[];
}

export class EditorApplicationSubmittedEvent implements IEvent {
  constructor(public readonly payload: IEditorApplicationSubmittedEvent) {}
}
