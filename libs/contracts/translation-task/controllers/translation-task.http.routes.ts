export const TRANSLATION_TASK_HTTP_CONTROLLER = 'translation-tasks';

export const TRANSLATION_TASK_HTTP_ROUTES = {
  AVAILABLE: 'available',
  AVAILABLE_EVALUATIONS: 'available-evaluations',
  PICK_EVALUATION: 'evaluations/pick',
  PICK: 'pick',
  SUBMIT: ':taskId/submit',
} as const;
