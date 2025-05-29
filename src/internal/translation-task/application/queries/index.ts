import { GetAvailableEvaluationTasksHandler } from './get-available-evaluation-tasks';
import { GetAvailableTasksHandler } from './get-available-tasks';

export * from './get-available-tasks';
export * from './get-available-evaluation-tasks';

export const TranslationTasksQueryHandlers = [
  GetAvailableEvaluationTasksHandler,
  GetAvailableTasksHandler,
];
