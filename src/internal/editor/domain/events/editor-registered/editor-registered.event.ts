interface IEditorRegisteredEventProps {
  editorId: string;
}

export class EditorRegisteredEvent {
  constructor(public readonly payload: IEditorRegisteredEventProps) {}
}
