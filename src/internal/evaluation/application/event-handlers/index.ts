import { EvaluationTaskCompletedHandler } from './evaluation-task-completed.handler';
import { EvaluationTaskRatedHandler } from './evaluation-task-rated.handler';
import { EvaluationSetCompletedHandler } from './evaluation-set-completed.handler';

export * from './evaluation-task-completed.handler';
export * from './evaluation-task-rated.handler';
export * from './evaluation-set-completed.handler';

export const EvaluationEventHandlers = [
  EvaluationTaskCompletedHandler,
  EvaluationTaskRatedHandler,
  EvaluationSetCompletedHandler,
];
