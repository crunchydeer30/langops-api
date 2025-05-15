import { ORDER_QUEUES } from './queues.constants';

export const MACHINE_TRANSLATION_FLOW = {
  queue: ORDER_QUEUES.FLOWS_MACHINE_TRANSLATION_QUEUE,
  name: 'flows_machine_translation',
  JOBS: {
    PARSE: {
      name: 'flows_machine_translation_parse',
      queue: ORDER_QUEUES.PARSE_QUEUE,
    },
    MASK: {
      name: 'flows_machine_translation_mask',
      queue: ORDER_QUEUES.MASK_QUEUE,
    },
    SEGMENT_TEXT: {
      name: 'flows_machine_translation_segment_text',
      queue: ORDER_QUEUES.SEGMENT_QUEUE,
    },
  },
} as const;
