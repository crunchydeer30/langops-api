import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { IEditorLanguagePairRepository } from '../../domain/ports/editor-language-pair.repository.interface';
import { EditorLanguagePair } from '../../domain/entities/editor-language-pair.entity';
import { EditorLanguagePairMapper } from '../mappers/editor-language-pair.mapper';

@Injectable()
export class EditorLanguagePairRepository
  implements IEditorLanguagePairRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EditorLanguagePairMapper,
  ) {}

  async findById(id: string): Promise<EditorLanguagePair | null> {
    const editorLanguagePair = await this.prisma.editorLanguagePair.findUnique({
      where: { id },
    });

    return editorLanguagePair ? this.mapper.toDomain(editorLanguagePair) : null;
  }

  async findByEditorAndLanguagePair(
    editorId: string,
    languagePairId: string,
  ): Promise<EditorLanguagePair | null> {
    const editorLanguagePair = await this.prisma.editorLanguagePair.findFirst({
      where: {
        editorId,
        languagePairId,
      },
    });

    return editorLanguagePair ? this.mapper.toDomain(editorLanguagePair) : null;
  }

  async findByEditor(editorId: string): Promise<EditorLanguagePair[]> {
    const editorLanguagePairs = await this.prisma.editorLanguagePair.findMany({
      where: {
        editorId,
      },
    });

    return editorLanguagePairs.map((editorLanguagePair) =>
      this.mapper.toDomain(editorLanguagePair),
    );
  }

  async findByLanguagePair(
    languagePairId: string,
  ): Promise<EditorLanguagePair[]> {
    const editorLanguagePairs = await this.prisma.editorLanguagePair.findMany({
      where: {
        languagePairId,
      },
    });

    return editorLanguagePairs.map((editorLanguagePair) =>
      this.mapper.toDomain(editorLanguagePair),
    );
  }

  async save(editorLanguagePair: EditorLanguagePair): Promise<void> {
    const data = this.mapper.toPersistence(editorLanguagePair);

    await this.prisma.editorLanguagePair.upsert({
      where: { id: editorLanguagePair.id },
      create: data,
      update: data,
    });
  }

  async saveMany(editorLanguagePairs: EditorLanguagePair[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const editorLanguagePair of editorLanguagePairs) {
        const data = this.mapper.toPersistence(editorLanguagePair);
        await tx.editorLanguagePair.upsert({
          where: { id: editorLanguagePair.id },
          create: data,
          update: data,
        });
      }
    });
  }
}
