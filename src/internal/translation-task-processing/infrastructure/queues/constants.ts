export const TRANSLATION_TASK_PARSING_QUEUES = {
  EMAIL_FLOW: 'email_translation_task_parsing_queue_flow',
  EMAIL_JOBS: 'email_translation_task_parsing_queue_jobs',
  ORCHESTRATOR: 'translation_task_parsing_orchestrator_queue',
} as const;

export const TRANSLATION_TASK_PARSING_FLOWS = {
  ORCHESTRATOR: {
    name: 'translation_task_parsing_orchestrator',
    queue: TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR,
  },
  EMAIL: {
    name: 'email_translation_task_parsing_flow',
    queue: TRANSLATION_TASK_PARSING_QUEUES.EMAIL_FLOW,
    JOBS: {
      VALIDATE: {
        name: 'validate',
      },
      PARSE: {
        name: 'parse',
      },
    },
  },
} as const;
