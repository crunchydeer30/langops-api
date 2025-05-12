import {
  CustomerRegisteredHandler,
  EditorApplicationApprovedHandler,
  EditorApplicationSubmittedHandler,
} from './handlers';

export * from './handlers';

export const EmailEventHandlers = [
  CustomerRegisteredHandler,
  EditorApplicationApprovedHandler,
  EditorApplicationSubmittedHandler,
];
