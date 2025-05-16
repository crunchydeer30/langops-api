export const TRANSLATION_TASK_PARSING_QUEUES = {
  TRANSLATION_TASK_PARSING_FLOW_QUEUE: 'translation_task_parsing_flow_queue',
  TRANSLATION_TASK_PARSING_JOBS_QUEUE: 'translation_task_parsing_jobs_queue',
} as const;

export const TRANSLATION_TASK_PARSING_FLOW = {
  name: 'translation_task_parsing_flow',
  queue: TRANSLATION_TASK_PARSING_QUEUES.TRANSLATION_TASK_PARSING_FLOW_QUEUE,
} as const;

export const TRANSLATION_TASK_PARSING_JOBS = {
  SEGMENT_TRANSLATION_TASK: {
    name: 'segment_translation_task',
    queue: TRANSLATION_TASK_PARSING_QUEUES.TRANSLATION_TASK_PARSING_JOBS_QUEUE,
  },
  ANONYMIZE_TRANSLATION_TASK: {
    name: 'anonymize_translation_task',
    queue: TRANSLATION_TASK_PARSING_QUEUES.TRANSLATION_TASK_PARSING_JOBS_QUEUE,
  },
} as const;
