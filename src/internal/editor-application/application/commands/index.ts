import { ApproveEditorApplicationHandler } from './approve-editor-application';
import { RejectEditorApplicationHandler } from './reject-editor-application';
import { SubmitEditorApplicationHandler } from './submit-editor-application';

export * from './approve-editor-application';
export * from './reject-editor-application';
export * from './submit-editor-application';

export const EditorApplicationCommandHandlers = [
  SubmitEditorApplicationHandler,
  ApproveEditorApplicationHandler,
  RejectEditorApplicationHandler,
];
