import { InitiateEditorEvaluationHandler } from './initiate-editor-evaluation';
import { RateEvaluationTaskHandler } from './rate-evaluation-task';
import { StartReviewHandler } from './start-review';

export const EvaluationCommandHandlers = [
  InitiateEditorEvaluationHandler,
  StartReviewHandler,
  RateEvaluationTaskHandler,
];

export * from './initiate-editor-evaluation';
export * from './start-review';
export * from './rate-evaluation-task';
