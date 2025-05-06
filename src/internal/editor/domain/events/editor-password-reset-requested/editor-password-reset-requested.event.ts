export interface IEditorPasswordResetRequestedEventProps {
  editorId: string;
  plainToken: string;
}

export class EditorPasswordResetRequestedEvent {
  constructor(
    public readonly payload: IEditorPasswordResetRequestedEventProps,
  ) {}
}
