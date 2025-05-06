export interface IEditorPasswordResetRequestedEventProps {
  editorId: string;
  token: string;
}

export class EditorPasswordResetRequestedEvent {
  constructor(
    public readonly payload: IEditorPasswordResetRequestedEventProps,
  ) {}
}
