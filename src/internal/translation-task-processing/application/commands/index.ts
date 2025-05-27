import { ProcessHtmlTaskHandler } from './process-html-task/process-html-task.handler';
import { ProcessXliffTaskHandler } from './process-xliff-task';

export * from './process-html-task';

export const TranslationTaskProcessingCommandHandlers = [
  ProcessHtmlTaskHandler,
  ProcessXliffTaskHandler,
];
