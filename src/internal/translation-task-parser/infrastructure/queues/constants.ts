export const TRANSLATION_TASK_PARSING_QUEUES = {
  MAIN: 'main_translation_task_parsing_queue',
  EMAIL: 'email_translation_task_parsing_queue',
} as const;

export const TRANSLATION_TASK_PARSING_FLOWS = {
  MAIN: {
    name: 'main_translation_task_parsing_flow',
    queue: TRANSLATION_TASK_PARSING_QUEUES.MAIN,
  },
  EMAIL: {
    name: 'email_translation_task_parsing_flow',
    queue: TRANSLATION_TASK_PARSING_QUEUES.EMAIL,
  },
} as const;
