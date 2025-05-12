import { SetMetadata } from '@nestjs/common';

export const QUEUE_PROCESS_KEY = 'queue_process';

export interface QueueProcessOptions {
  name: string;
  concurrency?: number;
}

export const QueueProcess = (options: string | QueueProcessOptions) => {
  const processOptions: QueueProcessOptions =
    typeof options === 'string' ? { name: options } : options;

  return SetMetadata(QUEUE_PROCESS_KEY, processOptions);
};
