interface IEditorRegisteredEventProps {
  editorId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class EditorRegisteredEvent {
  constructor(public readonly payload: IEditorRegisteredEventProps) {}
}
