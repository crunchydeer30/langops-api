export interface IEditorPasswordChangedEventProps {
  editorId: string;
}

export class EditorPasswordChangedEvent {
  constructor(public readonly payload: IEditorPasswordChangedEventProps) {}
}
