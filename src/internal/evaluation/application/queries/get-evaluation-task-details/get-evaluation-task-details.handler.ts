import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EditorRole, EvaluationSetStatus } from '@prisma/client';
import {
  GetEvaluationTaskDetailsQuery,
  IGetEvaluationTaskDetailsQueryResponse,
} from './get-evaluation-task-details.query';
import { EvaluationSetRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { EvaluationTaskRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { EditorRepository } from 'src/internal/editor/infrastructure';

@QueryHandler(GetEvaluationTaskDetailsQuery)
export class GetEvaluationTaskDetailsHandler
  implements IQueryHandler<GetEvaluationTaskDetailsQuery>
{
  private readonly logger = new Logger(GetEvaluationTaskDetailsHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly evaluationTaskRepository: EvaluationTaskRepository,
    private readonly editorRepository: EditorRepository,
  ) {}

  async execute(
    query: GetEvaluationTaskDetailsQuery,
  ): Promise<IGetEvaluationTaskDetailsQueryResponse> {
    const { evaluationSetId, taskId, reviewerId } = query.props;

    this.logger.log(
      `Fetching evaluation task details for task ${taskId} in evaluation set ${evaluationSetId}`,
    );

    const evaluationSet =
      await this.evaluationSetRepository.findById(evaluationSetId);

    if (!evaluationSet) {
      throw new DomainException(ERRORS.EVALUATION.NOT_FOUND);
    }

    if (evaluationSet.status !== EvaluationSetStatus.REVIEWING) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_STATE);
    }

    const editor = await this.editorRepository.findById(reviewerId);

    if (!editor || editor.role !== EditorRole.SENIOR) {
      throw new DomainException(ERRORS.EVALUATION.NOT_AUTHORIZED);
    }

    if (evaluationSet.evaluatorId !== reviewerId) {
      throw new DomainException(ERRORS.EVALUATION.NOT_AUTHORIZED);
    }

    const taskWithSegments =
      await this.evaluationTaskRepository.findTaskWithSegments(
        taskId,
        evaluationSetId,
      );

    if (!taskWithSegments) {
      throw new DomainException(ERRORS.EVALUATION.NOT_FOUND);
    }

    const segments = taskWithSegments.segments.map((segment) => ({
      id: segment.id,
      sourceText: segment.sourceSegmentText,
      machineTranslatedText: segment.machineTranslatedText,
      editedContent: segment.editedTranslatedText,
      order: segment.order,
    }));

    segments.sort((a, b) => a.order - b.order);

    const response: IGetEvaluationTaskDetailsQueryResponse = {
      id: taskWithSegments.id,
      rating: taskWithSegments.rating || null,
      feedback: taskWithSegments.seniorEditorFeedback || null,
      submissionDate: taskWithSegments.createdAt,
      segments,
    };

    this.logger.log(
      `Successfully fetched details for evaluation task ${taskId} with ${segments.length} segments`,
    );

    return response;
  }
}
