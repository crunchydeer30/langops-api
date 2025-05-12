import { CustomerEventHandlers } from './customers';
import { EditorApplicationEventHandlers } from './editor-application';

export * from './customers';
export * from './editor-application';

export const EmailEventHandlers = [
  ...CustomerEventHandlers,
  ...EditorApplicationEventHandlers,
];
