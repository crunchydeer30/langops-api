import { Injectable } from '@nestjs/common';
import {
  IEvaluationTaskRepository,
  IEvaluationTaskWithSegments,
} from '../../domain/ports/evaluation-task.repository';
import { EvaluationTask } from '../../domain/entities/evaluation-task.entity';
import { EvaluationTaskMapper } from '../mappers/evaluation-task.mapper';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class EvaluationTaskRepository implements IEvaluationTaskRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EvaluationTaskMapper,
  ) {}

  async findById(id: string): Promise<EvaluationTask | null> {
    const model = await this.prisma.evaluationTask.findUnique({
      where: { id },
    });
    if (!model) return null;
    return this.mapper.toDomain(model);
  }

  async findByEvaluationSetId(
    evaluationSetId: string,
  ): Promise<EvaluationTask[]> {
    const models = await this.prisma.evaluationTask.findMany({
      where: { evaluationSetId },
    });
    return models.map((model) => this.mapper.toDomain(model));
  }

  async save(task: EvaluationTask): Promise<EvaluationTask> {
    const model = await this.prisma.evaluationTask.upsert({
      where: { id: task.id },
      create: this.mapper.toPersistenceForCreate(task),
      update: this.mapper.toPersistenceForUpdate(task),
    });
    return this.mapper.toDomain(model);
  }

  async findByTranslationTaskId(
    translationTaskId: string,
  ): Promise<EvaluationTask | null> {
    const model = await this.prisma.evaluationTask.findUnique({
      where: { translationTaskId: translationTaskId },
    });
    if (!model) return null;
    return this.mapper.toDomain(model);
  }

  async findTaskWithSegments(
    taskId: string,
    evaluationSetId?: string,
  ): Promise<IEvaluationTaskWithSegments | null> {
    const where: any = { id: taskId };
    if (evaluationSetId) {
      where.evaluationSetId = evaluationSetId;
    }

    const model = await this.prisma.evaluationTask.findFirst({
      where,
      include: {
        translationTask: {
          include: {
            segments: {
              orderBy: {
                segmentOrder: 'asc',
              },
            },
          },
        },
      },
    });

    if (!model) return null;

    return {
      id: model.id,
      rating: model.rating,
      seniorEditorFeedback: model.seniorEditorFeedback,
      evaluationSetId: model.evaluationSetId,
      translationTaskId: model.translationTaskId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,

      segments:
        model.translationTask?.segments.map((segment) => ({
          id: segment.id,
          sourceSegmentText: segment.sourceContent,
          machineTranslatedText: segment.machineTranslatedContent,
          editedTranslatedText: segment.editedContent,
          order: segment.segmentOrder,
        })) || [],
    } as IEvaluationTaskWithSegments;
  }
}
