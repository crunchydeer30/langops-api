import {
  CustomerRegisteredHandler,
  EditorApplicationRejectedHandler,
  EditorRegistrationTokenGeneratedHandler,
} from './handlers';

export * from './handlers';

export const EmailEventHandlers = [
  CustomerRegisteredHandler,
  EditorRegistrationTokenGeneratedHandler,
  EditorApplicationRejectedHandler,
];
