import { SubmitEditorApplicationHandler } from './submit-editor-application/submit-editor-application.handler';
import { ApproveEditorApplicationHandler } from './approve-editor-application/approve-editor-application.handler';
import { RejectEditorApplicationHandler } from './reject-editor-application/reject-editor-application.handler';

export const COMMAND_HANDLERS = [
  SubmitEditorApplicationHandler,
  ApproveEditorApplicationHandler,
  RejectEditorApplicationHandler,
];

export * from './submit-editor-application/submit-editor-application.command';
export * from './submit-editor-application/submit-editor-application.handler';
export * from './approve-editor-application/approve-editor-application.command';
export * from './approve-editor-application/approve-editor-application.handler';
export * from './reject-editor-application/reject-editor-application.command';
export * from './reject-editor-application/reject-editor-application.handler';
