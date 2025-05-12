import { EditorApplicationApprovedHandler } from './editor-application-approved.handler';
import { EditorApplicationRejectedHandler } from './editor-application-rejected.handler';
import { EditorApplicationSubmittedHandler } from './editor-application-submitted.handler';

export * from './editor-application-rejected.handler';
export * from './editor-application-approved.handler';
export * from './editor-application-submitted.handler';

export const EditorApplicationEventHandlers = [
  EditorApplicationApprovedHandler,
  EditorApplicationRejectedHandler,
  EditorApplicationSubmittedHandler,
];
