export interface IEditorPasswordChangedEventProps {
  editorId: string;
  // at: Date;
}

export class EditorPasswordChangedEvent {
  constructor(public readonly payload: IEditorPasswordChangedEventProps) {}
}
