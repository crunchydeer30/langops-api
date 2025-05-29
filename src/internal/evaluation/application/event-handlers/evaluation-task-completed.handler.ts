import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EvaluationTaskCompletedEvent } from 'src/internal/translation-task/domain/events';
import { EvaluationSetRepository } from '../../infrastructure/repositories/evaluation-set.repository';
import { EvaluationTaskRepository } from '../../infrastructure/repositories/evaluation-task.repository';

@EventsHandler(EvaluationTaskCompletedEvent)
export class EvaluationTaskCompletedHandler
  implements IEventHandler<EvaluationTaskCompletedEvent>
{
  private readonly logger = new Logger(EvaluationTaskCompletedHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly evaluationTaskRepository: EvaluationTaskRepository,
  ) {}

  async handle(event: EvaluationTaskCompletedEvent): Promise<void> {
    const { taskId } = event.payload;

    this.logger.debug(`Event payload: ${JSON.stringify(event.payload)}`);

    const evaluationTask =
      await this.evaluationTaskRepository.findByTranslationTaskId(taskId);
    if (!evaluationTask) {
      this.logger.warn(
        `Evaluation task for translation task ${taskId} not found`,
      );
      return;
    }

    const evaluationSetId = evaluationTask.evaluationSetId;

    this.logger.log(
      `Found evaluation set ${evaluationSetId} for task ${taskId}`,
    );

    const evaluationSet =
      await this.evaluationSetRepository.findById(evaluationSetId);
    if (!evaluationSet) {
      this.logger.warn(`Evaluation set ${evaluationSetId} not found`);
      return;
    }

    const allTasksCompleted =
      await this.evaluationSetRepository.areAllTasksCompleted(evaluationSetId);

    if (allTasksCompleted) {
      this.logger.log(
        `All tasks in evaluation set ${evaluationSetId} are completed, marking as ready for review`,
      );

      evaluationSet.markAsReadyForReview();
      await this.evaluationSetRepository.save(evaluationSet);
    } else {
      this.logger.log(
        `Not all tasks in evaluation set ${evaluationSetId} are completed yet`,
      );
    }
  }
}
