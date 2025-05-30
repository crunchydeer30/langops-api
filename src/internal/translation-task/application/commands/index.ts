import { CreateTranslationTaskHandler } from './create-translation-task/create-translation-task.handler';
import { PickEvaluationTaskHandler } from './pick-evaluation-task/pick-evaluation-task.handler';
import { PickTranslationTaskHandler } from './pick-translation-task/pick-translation-task.handler';
import { SubmitTranslationTaskHandler } from './submit-translation-task/submit-translation-task.handler';

export const CommandHandlers = [
  CreateTranslationTaskHandler,
  PickEvaluationTaskHandler,
  PickTranslationTaskHandler,
  SubmitTranslationTaskHandler,
];

export * from './create-translation-task';
export * from './pick-evaluation-task';
export * from './pick-translation-task';
export * from './submit-translation-task';
