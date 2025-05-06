export interface IEditorPasswordResetEventProps {
  editorId: string;
}

export class EditorPasswordResetEvent {
  constructor(public readonly payload: IEditorPasswordResetEventProps) {}
}
