import { ProcessHtmlTaskHandler } from './process-html-task/process-html-task.handler';
import { ProcessTextTaskHandler } from './process-text-task';
import { ProcessXliffTaskHandler } from './process-xliff-task';

export * from './process-html-task';
export * from './process-text-task';

export const TranslationTaskProcessingCommandHandlers = [
  ProcessHtmlTaskHandler,
  ProcessTextTaskHandler,
  ProcessXliffTaskHandler,
];
