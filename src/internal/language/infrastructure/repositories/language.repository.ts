import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { ILanguageRepository } from '../../domain/ports';
import { Language } from '../../domain/entities';
import { LanguageMapper } from '../mappers';

@Injectable()
export class LanguageRepository implements ILanguageRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: LanguageMapper,
  ) {}

  async findByCode(code: string): Promise<Language | null> {
    const language = await this.prisma.language.findUnique({
      where: { code },
    });

    return language ? this.mapper.toDomain(language) : null;
  }

  async findAll(): Promise<Language[]> {
    const languages = await this.prisma.language.findMany();
    return languages.map((language) => this.mapper.toDomain(language));
  }

  async save(language: Language): Promise<Language> {
    const data = this.mapper.toPersistence(language);

    const savedLanguage = await this.prisma.language.upsert({
      where: { code: language.code },
      update: data,
      create: data,
    });

    return this.mapper.toDomain(savedLanguage);
  }

  async delete(code: string): Promise<void> {
    await this.prisma.language.delete({
      where: { code },
    });
  }
}
