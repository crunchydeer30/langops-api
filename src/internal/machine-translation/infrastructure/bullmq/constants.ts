export const MACHINE_TRANSLATION_QUEUE = 'machine_translation_queue';

export const MACHINE_TRANSLATION_JOBS = {
  TRANSLATE: {
    name: 'machine_translation_translate',
    queue: MACHINE_TRANSLATION_QUEUE,
  },
} as const;
