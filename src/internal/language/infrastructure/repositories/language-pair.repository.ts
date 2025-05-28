import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ILanguagePairRepository } from '../../domain/ports';
import { LanguagePair } from '../../domain/entities';
import { LanguagePairMapper } from '../mappers';

@Injectable()
export class LanguagePairRepository implements ILanguagePairRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: LanguagePairMapper,
  ) {}

  async findById(id: string): Promise<LanguagePair | null> {
    const languagePair = await this.prisma.languagePair.findUnique({
      where: { id },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });

    return languagePair ? this.mapper.toDomain(languagePair) : null;
  }

  async findManyById(ids: string[]): Promise<LanguagePair[]> {
    const languagePairs = await this.prisma.languagePair.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });

    return languagePairs.map((languagePair) =>
      this.mapper.toDomain(languagePair),
    );
  }

  async findByLanguages(
    sourceLanguageCode: string,
    targetLanguageCode: string,
  ): Promise<LanguagePair | null> {
    const languagePair = await this.prisma.languagePair.findUnique({
      where: {
        sourceLanguageCode_targetLanguageCode: {
          sourceLanguageCode,
          targetLanguageCode,
        },
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });

    return languagePair ? this.mapper.toDomain(languagePair) : null;
  }

  async findByLanguageCodes(
    sourceLanguageCode: string,
    targetLanguageCode: string,
  ): Promise<LanguagePair | null> {
    const languagePair = await this.prisma.languagePair.findFirst({
      where: {
        AND: [
          { sourceLanguage: { code: sourceLanguageCode } },
          { targetLanguage: { code: targetLanguageCode } },
        ],
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });

    return languagePair ? this.mapper.toDomain(languagePair) : null;
  }

  async findAll(): Promise<LanguagePair[]> {
    const languagePairs = await this.prisma.languagePair.findMany({
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });
    return languagePairs.map((languagePair) =>
      this.mapper.toDomain(languagePair),
    );
  }

  async findAcceptingEditors(): Promise<LanguagePair[]> {
    const languagePairs = await this.prisma.languagePair.findMany({
      where: {
        isAcceptingEditors: true,
      },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
    });
    return languagePairs.map((languagePair) =>
      this.mapper.toDomain(languagePair),
    );
  }

  async save(languagePair: LanguagePair): Promise<LanguagePair> {
    const data = this.mapper.toPersistence(languagePair);

    const savedLanguagePair = await this.prisma.languagePair.upsert({
      where: { id: languagePair.id },
      include: {
        sourceLanguage: true,
        targetLanguage: true,
      },
      update: data,
      create: {
        id: languagePair.id,
        sourceLanguage: { connect: { code: languagePair.sourceLanguageCode } },
        targetLanguage: { connect: { code: languagePair.targetLanguageCode } },
      },
    });

    return this.mapper.toDomain(savedLanguagePair);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.languagePair.delete({
      where: { id },
    });
  }
}
