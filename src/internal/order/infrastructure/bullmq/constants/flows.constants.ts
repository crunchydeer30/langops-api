import { ORDER_QUEUES } from './queues.constants';

export const TRANSLATION_FLOW = {
  queue: ORDER_QUEUES.FLOWS_TRANSLATION_QUEUE,
  name: 'flows_translation',
  JOBS: {
    TRANSLATE: {
      name: 'flows_translation_translate',
      queue: ORDER_QUEUES.TRANSLATE_QUEUE,
    },
    PARSE: {
      name: 'flows_translation_parse',
      queue: ORDER_QUEUES.TRANSLATE_QUEUE,
    },
  },
} as const;
