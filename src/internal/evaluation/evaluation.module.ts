import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  EvaluationTaskRepository,
  EvaluationSetRepository,
} from './infrastructure/repositories';
import {
  EvaluationTaskMapper,
  EvaluationSetMapper,
} from './infrastructure/mappers';

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    EvaluationTaskRepository,
    EvaluationTaskMapper,
    EvaluationSetRepository,
    EvaluationSetMapper,
  ],
  exports: [EvaluationTaskRepository, EvaluationSetRepository],
})
export class EvaluationModule {}
