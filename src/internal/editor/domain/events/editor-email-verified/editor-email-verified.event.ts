export interface IEditorEmailVerifiedEventProps {
  editorId: string;
  // at: Date;
}

export class EditorEmailVerifiedEvent {
  constructor(public readonly payload: IEditorEmailVerifiedEventProps) {}
}
