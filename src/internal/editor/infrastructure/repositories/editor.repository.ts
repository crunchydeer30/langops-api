import { Injectable } from '@nestjs/common';
import { IEditorRepository } from '../../domain/ports/editor.repository.interface';
import { Editor } from '../../domain/entities/editor.entity';
import { EditorMapper } from '../mappers/editor.mapper';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { Email } from '@common/domain/value-objects';

@Injectable()
export class EditorRepository implements IEditorRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EditorMapper,
  ) {}

  async findById(id: string): Promise<Editor | null> {
    const editorModel = await this.prisma.editor.findUnique({ where: { id } });
    if (!editorModel) return null;
    return this.mapper.toDomain(editorModel);
  }

  async findByEmail(email: Email): Promise<Editor | null> {
    const editorModel = await this.prisma.editor.findUnique({
      where: { email: email.value },
    });
    return this.mapper.toDomain(editorModel);
  }

  async save(editor: Editor): Promise<void> {
    const persistenceData = this.mapper.toPersistence(editor);
    await this.prisma.editor.upsert({
      where: { id: editor.id },
      create: {
        ...persistenceData,
        role: editor.role,
      },
      update: {
        ...persistenceData,
        role: editor.role,
      },
    });
  }
}
