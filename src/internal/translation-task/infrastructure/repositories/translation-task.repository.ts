import { Injectable } from '@nestjs/common';
import { ITranslationTaskRepository } from '../../domain/ports/translation-task.repository.interface';
import { TranslationTask } from '../../domain/entities/translation-task.entity';
import { TranslationTaskMapper } from '../mappers/translation-task.mapper';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class TranslationTaskRepository implements ITranslationTaskRepository {
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
}
