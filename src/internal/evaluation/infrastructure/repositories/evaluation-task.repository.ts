import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { IEvaluationTaskRepository } from '../../domain/ports/evaluation-task.repository.interface';
import { EvaluationTask } from '../../domain/entities/evaluation-task.entity';
import { EvaluationTaskMapper } from '../mappers/evaluation-task.mapper';

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

  async save(task: EvaluationTask): Promise<void> {
    await this.prisma.evaluationTask.upsert({
      where: { id: task.id },
      create: this.mapper.toPersistenceForCreate(task),
      update: this.mapper.toPersistenceForUpdate(task),
    });
  }
}
