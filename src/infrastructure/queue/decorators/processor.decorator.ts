import { SetMetadata } from '@nestjs/common';

export const QUEUE_PROCESSOR_KEY = 'queue_processor';

export const QueueProcessor = (queueName: string) => {
  return SetMetadata(QUEUE_PROCESSOR_KEY, queueName);
};
