import { EditorApplicationSubmittedHandler } from './editor-application-submitted.handler';
import { EditorApplicationApprovedHandler } from './editor-application-approved.handler';

export const EVENT_HANDLERS = [
  EditorApplicationSubmittedHandler,
  EditorApplicationApprovedHandler,
];

export * from './editor-application-submitted.handler';
export * from './editor-application-approved.handler';
