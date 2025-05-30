import { CommandHandler, ICommandHandler, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  RateEvaluationTaskCommand,
  IRateEvaluationTaskCommandResponse,
} from './rate-evaluation-task.command';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EvaluationSetStatus } from '@prisma/client';
import {
  EvaluationSetRepository,
  EvaluationTaskRepository,
} from 'src/internal/evaluation/infrastructure/repositories';

@CommandHandler(RateEvaluationTaskCommand)
export class RateEvaluationTaskHandler
  implements
    ICommandHandler<
      RateEvaluationTaskCommand,
      IRateEvaluationTaskCommandResponse
    >
{
  private readonly logger = new Logger(RateEvaluationTaskHandler.name);

  constructor(
    private readonly evaluationTaskRepository: EvaluationTaskRepository,
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: RateEvaluationTaskCommand,
  ): Promise<IRateEvaluationTaskCommandResponse> {
    const { evaluationSetId, taskId, rating, feedback, evaluatorId } =
      command.payload;

    this.logger.log(
      `Processing rating for evaluation task ${taskId} in evaluation set ${evaluationSetId} by evaluator ${evaluatorId}`,
    );

    const evaluationSet =
      await this.evaluationSetRepository.findById(evaluationSetId);

    if (!evaluationSet) {
      throw new DomainException(ERRORS.EVALUATION.NOT_FOUND);
    }

    if (evaluationSet.evaluatorId !== evaluatorId) {
      throw new DomainException(ERRORS.EVALUATION.NOT_AUTHORIZED);
    }

    if (evaluationSet.status !== EvaluationSetStatus.REVIEWING) {
      throw new DomainException(ERRORS.EVALUATION.INVALID_STATUS);
    }

    const evaluationTask = await this.evaluationTaskRepository.findById(taskId);

    if (!evaluationTask) {
      throw new DomainException(ERRORS.EVALUATION.TASK_NOT_FOUND);
    }

    if (evaluationTask.evaluationSetId !== evaluationSetId) {
      throw new DomainException(ERRORS.EVALUATION.TASK_NOT_FOUND);
    }

    if (evaluationTask.rating !== 0 && evaluationTask.rating !== undefined) {
      throw new DomainException(ERRORS.EVALUATION.TASK_ALREADY_RATED);
    }

    this.eventPublisher.mergeObjectContext(evaluationTask);
    evaluationTask.rate(rating, feedback);

    const updatedTask =
      await this.evaluationTaskRepository.save(evaluationTask);
    evaluationTask.commit();

    return {
      id: updatedTask.id,
      rating: updatedTask.rating || 0,
      seniorEditorFeedback: updatedTask.seniorEditorFeedback || null,
      taskId: updatedTask.id,
      evaluationSetId: updatedTask.evaluationSetId,
      success: true,
    };
  }
}
