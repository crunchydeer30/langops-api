export const TRANSLATION_TASK_PARSING_QUEUES = {
  HTML_FLOW: 'html_translation_task_parsing_queue_flow',
  HTML_JOBS: 'html_translation_task_parsing_queue_jobs',
  ORCHESTRATOR: 'translation_task_parsing_orchestrator_queue',
} as const;

export const TRANSLATION_TASK_PARSING_FLOWS = {
  ORCHESTRATOR: {
    name: 'translation_task_parsing_orchestrator',
    queue: TRANSLATION_TASK_PARSING_QUEUES.ORCHESTRATOR,
  },
  HTML: {
    name: 'html_translation_task_parsing_flow',
    queue: TRANSLATION_TASK_PARSING_QUEUES.HTML_FLOW,
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
