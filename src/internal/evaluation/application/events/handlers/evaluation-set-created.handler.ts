import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { EvaluationSetCreatedEvent } from '../../../domain/events';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { TranslationTask } from 'src/internal/translation-task/domain/entities';
import { TranslationTaskStatus, TranslationStage } from '@prisma/client';
import { EvaluationSetRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { SampleEvaluationContentRepository } from 'src/internal/sample-evaluation-content/infrastructure/repositories/sample-evaluation-content.repository';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';

@Injectable()
@EventsHandler(EvaluationSetCreatedEvent)
export class EvaluationSetCreatedHandler
  implements IEventHandler<EvaluationSetCreatedEvent>
{
  private readonly logger = new Logger(EvaluationSetCreatedHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly sampleContentRepository: SampleEvaluationContentRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {}

  async handle(event: EvaluationSetCreatedEvent): Promise<void> {
    const { evaluationSetId, editorId, languagePairId, type } = event.payload;

    this.logger.log(
      `Processing EvaluationSetCreatedEvent for evaluation set ${evaluationSetId}, editor ${editorId}, language pair ${languagePairId}, type ${type}`,
    );

    try {
      const evaluationSet =
        await this.evaluationSetRepository.findById(evaluationSetId);
      if (!evaluationSet) {
        this.logger.error(`Evaluation set ${evaluationSetId} not found`);
        return;
      }

      const languagePair =
        await this.languagePairRepository.findById(languagePairId);
      if (!languagePair) {
        this.logger.error(`Language pair ${languagePairId} not found`);
        evaluationSet.markAsError();
        await this.evaluationSetRepository.save(evaluationSet);
        return;
      }

      const sampleTasks = await this.createSampleTasks(
        evaluationSet.id,
        languagePairId,
      );

      if (sampleTasks.length === 0) {
        this.logger.error(
          `Failed to create sample tasks for evaluation set ${evaluationSetId}`,
        );
        evaluationSet.markAsError();
        await this.evaluationSetRepository.save(evaluationSet);
        return;
      }

      evaluationSet.markAsReady();
      await this.evaluationSetRepository.save(evaluationSet);

      this.logger.log(
        `Successfully created ${sampleTasks.length} sample tasks for evaluation set ${evaluationSetId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing evaluation set ${evaluationSetId}: ${error instanceof Error ? error.message : String(error)}`,
      );

      const evaluationSet =
        await this.evaluationSetRepository.findById(evaluationSetId);
      if (evaluationSet) {
        evaluationSet.markAsError();
        await this.evaluationSetRepository.save(evaluationSet);
      }
    }
  }

  private async createSampleTasks(
    evaluationSetId: string,
    languagePairId: string,
  ): Promise<TranslationTask[]> {
    const samples =
      await this.sampleContentRepository.findByLanguagePairId(languagePairId);
    if (samples.length === 0) {
      return [];
    }
    const tasks: TranslationTask[] = [];
    for (const sample of samples) {
      const task = TranslationTask.create({
        originalContent: sample.content,
        taskType: sample.formatType,
        originalStructure: null,
        languagePairId,
        status: TranslationTaskStatus.NEW,
        currentStage: TranslationStage.QUEUED_FOR_PROCESSING,
        evaluationSetId,
      });

      await this.translationTaskRepository.save(task);
      tasks.push(task);
    }
    return tasks;
  }
}
