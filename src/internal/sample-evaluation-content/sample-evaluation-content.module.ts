import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SampleEvaluationContentMapper } from './infrastructure/mappers/sample-evaluation-content.mapper';
import { SampleEvaluationContentRepository } from './infrastructure/repositories/sample-evaluation-content.repository';

@Module({
  imports: [CqrsModule],
  providers: [SampleEvaluationContentRepository, SampleEvaluationContentMapper],
  exports: [SampleEvaluationContentRepository],
})
export class SampleEvaluationContentModule {}
