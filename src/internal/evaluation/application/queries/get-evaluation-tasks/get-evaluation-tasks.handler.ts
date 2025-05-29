import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import {
  GetEvaluationTasksQuery,
  IGetEvaluationTasksQueryResponse,
} from './get-evaluation-tasks.query';
import { EvaluationSetRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { EvaluationTaskRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { EvaluationSetStatus } from '@prisma/client';

@QueryHandler(GetEvaluationTasksQuery)
export class GetEvaluationTasksHandler
  implements
    IQueryHandler<GetEvaluationTasksQuery, IGetEvaluationTasksQueryResponse>
{
  private readonly logger = new Logger(GetEvaluationTasksHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly evaluationTaskRepository: EvaluationTaskRepository,
  ) {}

  async execute(
    query: GetEvaluationTasksQuery,
  ): Promise<IGetEvaluationTasksQueryResponse> {
    const { evaluationSetId, reviewerId } = query.props;

    this.logger.log(
      `Fetching evaluation tasks for evaluation set ${evaluationSetId} for reviewer ${reviewerId}`,
    );

    const evaluationSet =
      await this.evaluationSetRepository.findById(evaluationSetId);
    if (!evaluationSet) {
      throw new DomainException(ERRORS.EVALUATION.NOT_FOUND);
    }

    if (evaluationSet.evaluatorId !== reviewerId) {
      throw new DomainException(ERRORS.EVALUATION.NOT_AUTHORIZED);
    }

    if (evaluationSet.status !== EvaluationSetStatus.REVIEWING) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_STATE);
    }

    const tasks =
      await this.evaluationTaskRepository.findByEvaluationSetId(
        evaluationSetId,
      );

    const response = tasks.map((task) => ({
      id: task.id,
      rating: task.rating !== undefined ? task.rating : null,
      feedback:
        task.seniorEditorFeedback !== undefined
          ? task.seniorEditorFeedback
          : null,
      submissionDate: task.createdAt,
    }));

    this.logger.log(
      `Successfully fetched ${response.length} evaluation tasks for evaluation set ${evaluationSetId}`,
    );

    return response;
  }
}
