import { Injectable, Logger } from '@nestjs/common';
import {
  Queue,
  Worker,
  Processor,
  QueueOptions,
  JobsOptions,
  Job,
} from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private queues: Map<string, Queue> = new Map();

  getQueue(name: string, options?: QueueOptions): Queue {
    if (!this.queues.has(name)) {
      this.logger.log(`Creating new queue: ${name}`);
      const queue = new Queue(name, options);
      this.queues.set(name, queue);
      return queue;
    }

    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue ${name} not found`);
    }
    return queue;
  }

  async addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    options?: JobsOptions,
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    this.logger.log(`Adding job '${jobName}' to queue '${queueName}'`);
    return await queue.add(jobName, data, options);
  }

  async getJobCount(queueName: string): Promise<number> {
    const queue = this.getQueue(queueName);
    return await queue.count();
  }

  async removeQueue(queueName: string): Promise<void> {
    if (this.queues.has(queueName)) {
      const queue = this.queues.get(queueName);
      if (queue) {
        this.logger.log(`Removing queue: ${queueName}`);
        await queue.drain();
        await queue.close();
        this.queues.delete(queueName);
      }
    }
  }

  registerProcessor<T>(
    queueName: string,
    processor: Processor<T>,
    concurrency: number = 1,
  ): Worker<T> {
    this.logger.log(`Registering processor for queue: ${queueName}`);
    return new Worker(queueName, processor, {
      concurrency,
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    });
  }
}
