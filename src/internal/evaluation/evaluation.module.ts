import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EvaluationTaskRepository } from './infrastructure/repositories/evaluation-task.repository';
import { EvaluationTaskMapper } from './infrastructure/mappers/evaluation-task.mapper';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [EvaluationTaskRepository, EvaluationTaskMapper],
  exports: [EvaluationTaskRepository],
})
export class EvaluationModule {}
