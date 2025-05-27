import { ProcessHtmlTaskHandler } from './process-html-task/process-html-task.handler';

export * from './process-html-task';

export const TranslationTaskProcessingCommandHandlers = [
  ProcessHtmlTaskHandler,
];
