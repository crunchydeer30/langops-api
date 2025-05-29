import { Injectable, Logger } from '@nestjs/common';
import { ITranslationTaskRepository } from '../../domain/ports/translation-task.repository.interface';
import { TranslationTask } from '../../domain/entities/translation-task.entity';
import { TranslationTaskMapper } from '../mappers/translation-task.mapper';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import {
  EditorLanguagePairQualificationStatus,
  EvaluationSetStatus,
  TranslationStage,
  TranslationTaskStatus,
} from '@prisma/client';

@Injectable()
export class TranslationTaskRepository implements ITranslationTaskRepository {
  private readonly logger = new Logger(TranslationTaskRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TranslationTaskMapper,
  ) {}

  async findById(id: string): Promise<TranslationTask | null> {
    const model = await this.prisma.translationTask.findUnique({
      where: { id },
    });
    if (!model) return null;
    return this.mapper.toDomain(model);
  }

  async save(task: TranslationTask): Promise<void> {
    await this.prisma.translationTask.upsert({
      where: { id: task.id },
      create: this.mapper.toPersistenceForCreate(task),
      update: this.mapper.toPersistenceForUpdate(task),
    });
  }

  async saveSegmentEdits(
    taskId: string,
    segmentEdits: Array<{ segmentId: string; editedContent: string }>,
  ): Promise<void> {
    this.logger.debug(
      `Saving edited content for ${segmentEdits.length} segments in task ${taskId}`,
    );

    for (const edit of segmentEdits) {
      await this.prisma.translationTaskSegment.update({
        where: { id: edit.segmentId },
        data: { editedContent: edit.editedContent },
      });
    }

    this.logger.debug(
      `Successfully saved edited content for ${segmentEdits.length} segments in task ${taskId}`,
    );
  }

  async countQueuedForEditing(languagePairId: string): Promise<number> {
    this.logger.debug(
      `Counting tasks queued for editing in language pair: ${languagePairId}`,
    );

    const count = await this.prisma.translationTask.count({
      where: {
        languagePairId,
        status: TranslationTaskStatus.IN_PROGRESS,
        currentStage: TranslationStage.QUEUED_FOR_EDITING,
        isEvaluationTask: false,
      },
    });

    this.logger.debug(
      `Found ${count} tasks queued for editing in language pair: ${languagePairId}`,
    );
    return count;
  }

  async isEditorQualifiedForLanguagePair(
    editorId: string,
    languagePairId: string,
  ): Promise<boolean> {
    this.logger.debug(
      `Checking if editor ${editorId} is qualified for language pair: ${languagePairId}`,
    );

    const editorLanguagePair = await this.prisma.editorLanguagePair.findFirst({
      where: {
        editorId,
        languagePairId,
        qualificationStatus: EditorLanguagePairQualificationStatus.QUALIFIED,
      },
    });

    const isQualified = !!editorLanguagePair;

    return isQualified;
  }

  async isEditorEligibleForEvaluation(
    editorId: string,
    languagePairId: string,
  ): Promise<boolean> {
    this.logger.debug(
      `Checking if editor ${editorId} is eligible for evaluation in language pair: ${languagePairId}`,
    );

    const editorLanguagePair = await this.prisma.editorLanguagePair.findFirst({
      where: {
        editorId,
        languagePairId,
        qualificationStatus:
          EditorLanguagePairQualificationStatus.INITIAL_EVALUATION_IN_PROGRESS,
      },
    });

    const isEligible = !!editorLanguagePair;
    return isEligible;
  }

  async countQueuedForEvaluation(languagePairId: string): Promise<number> {
    this.logger.debug(
      `Counting tasks queued for evaluation in language pair: ${languagePairId}`,
    );

    const count = await this.prisma.translationTask.count({
      where: {
        languagePairId,
        status: TranslationTaskStatus.IN_PROGRESS,
        currentStage: TranslationStage.QUEUED_FOR_EDITING,
        isEvaluationTask: true,
      },
    });

    this.logger.debug(
      `Found ${count} tasks queued for evaluation in language pair: ${languagePairId}`,
    );
    return count;
  }

  async findEvaluationTaskForEditor(
    editorId: string,
    languagePairId: string,
  ): Promise<TranslationTask | null> {
    this.logger.debug(
      `Finding evaluation task for editor ${editorId} in language pair: ${languagePairId}`,
    );

    const editorLanguagePair = await this.prisma.editorLanguagePair.findFirst({
      where: {
        editorId,
        languagePairId,
        qualificationStatus:
          EditorLanguagePairQualificationStatus.INITIAL_EVALUATION_IN_PROGRESS,
      },
      include: {
        evaluationSet: {
          where: {
            status: EvaluationSetStatus.IN_PROGRESS,
          },
        },
      },
    });

    if (!editorLanguagePair || !editorLanguagePair.evaluationSet) {
      this.logger.debug(
        `No active evaluation set found for editor ${editorId} in language pair ${languagePairId}`,
      );
      return null;
    }

    const evaluationSetId = editorLanguagePair.evaluationSet.id;

    const evaluationTask = await this.prisma.evaluationTask.findFirst({
      where: {
        evaluationSetId,
        translationTask: {
          currentStage: TranslationStage.QUEUED_FOR_EDITING,
          isEvaluationTask: true,
        },
      },
      include: {
        translationTask: true,
      },
      orderBy: {
        translationTask: {
          createdAt: 'asc',
        },
      },
    });

    if (!evaluationTask || !evaluationTask.translationTask) {
      this.logger.debug(
        `No available evaluation tasks found for editor ${editorId} in evaluation set ${evaluationSetId}`,
      );
      return null;
    }

    this.logger.debug(
      `Found evaluation task ${evaluationTask.translationTask.id} for editor ${editorId} in language pair ${languagePairId}`,
    );
    return this.mapper.toDomain(evaluationTask.translationTask);
  }

  async findTaskWithSegments(taskId: string): Promise<{
    task: TranslationTask;
    segments: Array<{
      id: string;
      segmentOrder: number;
      segmentType: string;
      anonymizedContent: string | null;
      machineTranslatedContent: string | null;
    }>;
  } | null> {
    this.logger.debug(`Finding task ${taskId} with its segments`);

    const task = await this.prisma.translationTask.findUnique({
      where: { id: taskId },
      include: {
        segments: {
          orderBy: {
            segmentOrder: 'asc',
          },
        },
      },
    });

    if (!task) {
      this.logger.debug(`Task ${taskId} not found`);
      return null;
    }

    this.logger.debug(
      `Found task ${taskId} with ${task.segments.length} segments`,
    );

    const mappedSegments = task.segments.map((segment) => ({
      id: segment.id,
      segmentOrder: segment.segmentOrder,
      segmentType: segment.segmentType,
      anonymizedContent: segment.anonymizedContent,
      machineTranslatedContent: segment.machineTranslatedContent,
    }));

    return {
      task: this.mapper.toDomain(task),
      segments: mappedSegments,
    };
  }
}
