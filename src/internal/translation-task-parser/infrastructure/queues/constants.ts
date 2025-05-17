export const TRANSLATION_TASK_PARSING_QUEUES = {
  MAIN_FLOW: 'main_translation_task_parsing_queue_flow',
  MAIN_JOBS: 'main_translation_task_parsing_queue_jobs',
  EMAIL_FLOW: 'email_translation_task_parsing_queue_flow',
  EMAIL_JOBS: 'email_translation_task_parsing_queue_jobs',
} as const;

export const TRANSLATION_TASK_PARSING_FLOWS = {
  MAIN: {
    name: 'main_translation_task_parsing_flow',
    queue: TRANSLATION_TASK_PARSING_QUEUES.MAIN_FLOW,
  },
  EMAIL: {
    name: 'email_translation_task_parsing_flow',
    queue: TRANSLATION_TASK_PARSING_QUEUES.EMAIL_FLOW,
    JOBS: {
      VALIDATE: {
        name: 'validate',
      },
    },
  },
} as const;
