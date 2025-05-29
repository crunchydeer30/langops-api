export const EVALUATION_HTTP_CONTROLLER = 'evaluation';

export const EVALUATION_HTTP_ROUTES = {
  INITIATE_EVALUATION: '/initiate',
  PENDING_REVIEW: '/pending-review',
  START_REVIEW: '/:evaluationId/start-review',
  GET_EVALUATION_TASKS: '/:evaluationId/tasks',
  GET_EVALUATION_TASK_DETAILS: '/:evaluationId/tasks/:taskId',
} as const;
