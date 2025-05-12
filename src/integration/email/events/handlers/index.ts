import { CustomerEventHandlers } from './customers';
import { EditorApplicationEventHandlers } from './editor-application';
import { EditorEventHandlers } from './editors';

export * from './customers';
export * from './editor-application';
export * from './editors';

export const EmailEventHandlers = [
  ...CustomerEventHandlers,
  ...EditorApplicationEventHandlers,
  ...EditorEventHandlers,
];
