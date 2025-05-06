interface IEditorEmailVerificationTokenGeneratedEventProps {
  editorId: string;
  plainToken: string;
}

export class EditorEmailVerificationTokenGeneratedEvent {
  constructor(
    public readonly payload: IEditorEmailVerificationTokenGeneratedEventProps,
  ) {}
}
