import { Injectable, Logger } from '@nestjs/common';
import {
  EvaluationSet as PrismaEvaluationSet,
  EvaluationType,
  EvaluationSetStatus,
  TranslationTaskStatus,
  TranslationStage,
} from '@prisma/client';
import { EvaluationSet } from '../../domain/entities';
import { IEvaluationSetRepository } from '../../domain/ports';
import { EvaluationSetMapper } from '../mappers';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  FormatMetadata,
  OriginalStructure,
  TranslationSpecialTokenMap,
} from 'src/internal/translation-task-processing/domain/interfaces';

@Injectable()
export class EvaluationSetRepository implements IEvaluationSetRepository {
  private readonly logger = new Logger(EvaluationSetRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EvaluationSetMapper,
  ) {}

  async findById(id: string): Promise<EvaluationSet | null> {
    this.logger.debug(`Finding evaluation set by id: ${id}`);
    const evaluationSet = await this.prisma.evaluationSet.findUnique({
      where: { id },
    });

    if (!evaluationSet) {
      this.logger.debug(`Evaluation set with id ${id} not found`);
      return null;
    }

    this.logger.debug(`Evaluation set with id ${id} found`);
    return this.mapper.toDomain(evaluationSet);
  }

  async findByEditorIdAndLanguagePairId(
    editorId: string,
    languagePairId: string,
  ): Promise<EvaluationSet[]> {
    this.logger.debug(
      `Finding evaluation sets for editor ${editorId} and language pair ${languagePairId}`,
    );
    const evaluationSets = await this.prisma.evaluationSet.findMany({
      where: {
        editorId,
        languagePairId,
      },
    });

    this.logger.debug(
      `Found ${evaluationSets.length} evaluation sets for editor ${editorId} and language pair ${languagePairId}`,
    );
    return evaluationSets.map((evaluationSet) =>
      this.mapper.toDomain(evaluationSet),
    );
  }

  async findByEditorId(editorId: string): Promise<EvaluationSet[]> {
    this.logger.debug(`Finding evaluation sets for editor ${editorId}`);
    const evaluationSets = await this.prisma.evaluationSet.findMany({
      where: {
        editorId,
      },
    });

    this.logger.debug(
      `Found ${evaluationSets.length} evaluation sets for editor ${editorId}`,
    );
    return evaluationSets.map((evaluationSet) =>
      this.mapper.toDomain(evaluationSet),
    );
  }

  async save(evaluationSet: EvaluationSet): Promise<EvaluationSet> {
    this.logger.debug(`Saving evaluation set with id ${evaluationSet.id}`);

    const exists = await this.prisma.evaluationSet.findUnique({
      where: { id: evaluationSet.id },
    });

    let savedEvaluationSet: PrismaEvaluationSet;

    if (exists) {
      this.logger.debug(`Updating existing evaluation set ${evaluationSet.id}`);
      savedEvaluationSet = await this.prisma.evaluationSet.update({
        where: { id: evaluationSet.id },
        data: this.mapper.toUpdatePersistence(evaluationSet),
      });
    } else {
      this.logger.debug(`Creating new evaluation set ${evaluationSet.id}`);
      savedEvaluationSet = await this.prisma.evaluationSet.create({
        data: this.mapper.toPersistence(evaluationSet),
      });
    }

    this.logger.debug(`Evaluation set ${evaluationSet.id} saved successfully`);
    return this.mapper.toDomain(savedEvaluationSet);
  }

  async generateInitialEvaluation(
    evaluationType: EvaluationType,
    editorId: string,
    languagePairId: string,
    editorLanguagePairId?: string | null,
    evaluatorId?: string | null,
    limit = 5,
  ): Promise<EvaluationSet> {
    this.logger.log(
      `Generating initial evaluation for editor ${editorId} with language pair ${languagePairId}`,
    );

    return await this.prisma.$transaction(async (tx) => {
      const evaluationSetId = uuidv4();
      const now = new Date();

      const evaluationSetData = {
        id: evaluationSetId,
        type: evaluationType,
        status: EvaluationSetStatus.IN_PROGRESS,
        editorId,
        languagePairId,
        evaluatorId: evaluatorId || null,
        editorLanguagePairId: editorLanguagePairId || null,
        createdAt: now,
        updatedAt: now,
      };

      const createdEvaluationSet = await tx.evaluationSet.create({
        data: evaluationSetData,
      });

      this.logger.log(`Created evaluation set with ID: ${evaluationSetId}`);

      const existingTasks = await tx.translationTask.findMany({
        where: {
          languagePairId,
          status: TranslationTaskStatus.COMPLETED,
          isEvaluationTask: false,
        },
        orderBy: { completedAt: 'desc' },
        take: limit,
        include: {
          segments: true,
        },
      });

      this.logger.log(
        `Found ${existingTasks.length} tasks to copy for evaluation`,
      );

      for (const existingTask of existingTasks) {
        const newTaskId = uuidv4();

        await tx.translationTask.create({
          data: {
            id: newTaskId,
            languagePairId: existingTask.languagePairId,
            editorId,
            originalContent: existingTask.originalContent,
            formatType: existingTask.formatType,
            originalStructure:
              existingTask.originalStructure as OriginalStructure,
            status: TranslationTaskStatus.IN_PROGRESS,
            currentStage: TranslationStage.QUEUED_FOR_EDITING,
            wordCount: existingTask.wordCount,
            editorAssignedAt: now,
            isEvaluationTask: true,
          },
        });

        await tx.evaluationTask.create({
          data: {
            id: uuidv4(),
            evaluationSetId,
            translationTaskId: newTaskId,
          },
        });

        if (existingTask.segments?.length) {
          for (const segment of existingTask.segments) {
            await tx.translationTaskSegment.create({
              data: {
                id: uuidv4(),
                translationTaskId: newTaskId,
                segmentOrder: segment.segmentOrder,
                segmentType: segment.segmentType,
                sourceContent: segment.sourceContent,
                machineTranslatedContent: segment.machineTranslatedContent,
                specialTokensMap:
                  segment.specialTokensMap as TranslationSpecialTokenMap,
                formatMetadata: segment.formatMetadata as FormatMetadata,
              },
            });
          }
        }

        this.logger.log(
          `Created evaluation task for translation task ${newTaskId}`,
        );
      }

      this.logger.log(
        `Successfully created evaluation set with ${existingTasks.length} tasks`,
      );

      return this.mapper.toDomain(createdEvaluationSet);
    });
  }

  async areAllTasksCompleted(evaluationSetId: string): Promise<boolean> {
    this.logger.debug(
      `Checking if all tasks in evaluation set ${evaluationSetId} are completed`,
    );

    const totalTaskCount = await this.prisma.evaluationTask.count({
      where: { evaluationSetId },
    });

    if (totalTaskCount === 0) {
      this.logger.debug(`No tasks found for evaluation set ${evaluationSetId}`);
      return false;
    }

    const completedTaskCount = await this.prisma.evaluationTask.count({
      where: {
        evaluationSetId,
        translationTask: {
          status: TranslationTaskStatus.COMPLETED,
        },
      },
    });

    const allCompleted = completedTaskCount === totalTaskCount;

    this.logger.debug(
      `Evaluation set ${evaluationSetId} has ${completedTaskCount}/${totalTaskCount} tasks completed, all completed: ${allCompleted}`,
    );

    return allCompleted;
  }

  async findPendingReviewSets(
    languagePairIds: string[],
    specificLanguagePairId?: string,
  ): Promise<EvaluationSet[]> {
    this.logger.debug(
      `Finding pending review sets for language pairs: ${languagePairIds.join(', ')}`,
    );

    const where = {
      status: EvaluationSetStatus.READY_FOR_REVIEW,
      languagePairId: specificLanguagePairId
        ? specificLanguagePairId
        : { in: languagePairIds },
      evaluatorId: null,
    };

    const evaluationSets = await this.prisma.evaluationSet.findMany({
      where,
      include: {
        languagePair: true,
        tasks: true,
      },
    });

    return evaluationSets.map((set) => this.mapper.toDomain(set));
  }
}
