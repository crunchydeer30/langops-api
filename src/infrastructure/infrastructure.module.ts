import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [DatabaseModule, QueueModule],
})
export class InfrastructureModule {}
