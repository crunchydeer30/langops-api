export interface IEditorEmailVerifiedEventProps {
  editorId: string;
}

export class EditorEmailVerifiedEvent {
  constructor(public readonly payload: IEditorEmailVerifiedEventProps) {}
}
