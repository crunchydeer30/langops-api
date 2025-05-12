interface IEditorLoggedInEventProps {
  editorId: string;
  loggedInAt: Date;
}

export class EditorLoggedInEvent {
  constructor(public readonly payload: IEditorLoggedInEventProps) {}
}
