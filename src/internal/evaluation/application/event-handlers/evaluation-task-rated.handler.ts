import { EventPublisher, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EvaluationTaskRatedEvent } from '../../domain/events';
import { EvaluationSetStatus } from '@prisma/client';
import {
  EvaluationSetRepository,
  EvaluationTaskRepository,
} from '../../infrastructure/repositories';

@EventsHandler(EvaluationTaskRatedEvent)
export class EvaluationTaskRatedHandler
  implements IEventHandler<EvaluationTaskRatedEvent>
{
  private readonly logger = new Logger(EvaluationTaskRatedHandler.name);

  constructor(
    private readonly evaluationTaskRepository: EvaluationTaskRepository,
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(event: EvaluationTaskRatedEvent): Promise<void> {
    const { evaluationSetId } = event.payload;

    this.logger.log(
      `Handling evaluation task rated event for set ${evaluationSetId}`,
    );

    const tasks =
      await this.evaluationTaskRepository.findByEvaluationSetId(
        evaluationSetId,
      );

    const allTasksRated = tasks.every(
      (task) => task.rating !== null && task.rating !== undefined,
    );

    if (allTasksRated) {
      this.logger.log(
        `All tasks in evaluation set ${evaluationSetId} have been rated. Checking for completion.`,
      );

      const evaluationSet =
        await this.evaluationSetRepository.findById(evaluationSetId);

      if (
        evaluationSet &&
        evaluationSet.status === EvaluationSetStatus.REVIEWING
      ) {
        const totalRating = tasks.reduce(
          (sum, task) => sum + (task.rating || 0),
          0,
        );
        const averageRating = totalRating / tasks.length;

        this.logger.log(
          `Completing evaluation set ${evaluationSetId} with average rating ${averageRating}`,
        );

        this.eventPublisher.mergeObjectContext(evaluationSet);

        try {
          evaluationSet.markAsCompleted(averageRating);

          await this.evaluationSetRepository.save(evaluationSet);
          evaluationSet.commit();

          this.logger.log(
            `Successfully completed evaluation set ${evaluationSetId}`,
          );
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            `Cannot complete evaluation set ${evaluationSetId}: ${err.message}`,
            err.stack,
          );
        }
      }
    } else {
      this.logger.log(
        `Not all tasks in evaluation set ${evaluationSetId} have been rated yet. Waiting for all ratings.`,
      );
    }
  }
}
