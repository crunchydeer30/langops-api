import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import {
  ITranslationRepository,
  TranslationCriteria,
} from '../../domain/ports/translation.repository';
import { Translation } from '../../domain/entities/translation.entity';
import { TranslationMapper } from '../mappers/translation.mapper';

@Injectable()
export class TranslationRepository implements ITranslationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TranslationMapper,
  ) {}

  async findById(id: string): Promise<Translation | null> {
    const translation = await this.prisma.translation.findUnique({
      where: { id },
    });

    return translation ? this.mapper.toDomain(translation) : null;
  }

  async findByCustomerId(customerId: string): Promise<Translation[]> {
    const translations = await this.prisma.translation.findMany({
      where: { customerId },
    });

    return translations.map((translation) => this.mapper.toDomain(translation));
  }

  async findByTranslationTaskId(
    translationTaskId: string,
  ): Promise<Translation | null> {
    const translation = await this.prisma.translation.findUnique({
      where: { translationTaskId },
    });

    return translation ? this.mapper.toDomain(translation) : null;
  }

  async findOneWithCriteria(
    criteria: TranslationCriteria,
  ): Promise<Translation | null> {
    const translation = await this.prisma.translation.findFirst({
      where: criteria,
      include: {
        translationTask: true,
      },
    });

    return translation ? this.mapper.toDomain(translation) : null;
  }

  async findManyWithCriteria(
    criteria: TranslationCriteria,
    limit = 20,
    offset = 0,
  ): Promise<Translation[]> {
    const translations = await this.prisma.translation.findMany({
      where: criteria,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        translationTask: true,
      },
    });

    return translations.map((translation) => this.mapper.toDomain(translation));
  }

  async findAll(): Promise<Translation[]> {
    const translations = await this.prisma.translation.findMany();
    return translations.map((translation) => this.mapper.toDomain(translation));
  }

  async save(translation: Translation): Promise<Translation> {
    const data = this.mapper.toPersistence(translation);

    const savedTranslation = await this.prisma.translation.upsert({
      where: { id: translation.id },
      update: data,
      create: data,
    });

    return this.mapper.toDomain(savedTranslation);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.translation.delete({
      where: { id },
    });
  }
}
