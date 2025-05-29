import { CreateTranslationTaskHandler } from './create-translation-task/create-translation-task.handler';
import { PickEvaluationTaskHandler } from './pick-evaluation-task/pick-evaluation-task.handler';

export const CommandHandlers = [
  CreateTranslationTaskHandler,
  PickEvaluationTaskHandler,
];

export * from './create-translation-task';
export * from './pick-evaluation-task';
