import { InitiateEditorEvaluationHandler } from './initiate-editor-evaluation';
import { StartReviewHandler } from './start-review';

export const EvaluationCommandHandlers = [
  InitiateEditorEvaluationHandler,
  StartReviewHandler,
];

export * from './initiate-editor-evaluation';
export * from './start-review';
