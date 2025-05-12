import { Editor as EditorModel, EditorRole } from '@prisma/client';
import { Editor, IEditor } from '../../domain/entities/editor.entity';
import { Injectable } from '@nestjs/common';
import { Email, VerificationToken } from '@common/domain/value-objects';

@Injectable()
export class EditorMapper {
  toDomain(model: EditorModel | null): Editor | null {
    if (!model) return null;

    const editorProps: IEditor = {
      id: model.id,
      email: Email.create(model.email),
      passwordHash: model.passwordHash,
      firstName: model.firstName,
      lastName: model.lastName,
      role: model.role,
      passwordResetToken: model.passwordResetTokenHash
        ? new VerificationToken(model.passwordResetTokenHash)
        : null,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return Editor.reconstitute(editorProps);
  }

  toPersistence(editor: Editor): Omit<
    EditorModel,
    'createdAt' | 'updatedAt' | 'role'
  > & {
    role: EditorRole;
  } {
    return {
      id: editor.id,
      email: editor.email.value,
      passwordHash: editor.passwordHash,
      firstName: editor.firstName,
      lastName: editor.lastName,
      role: editor.role,
      passwordResetTokenHash: editor.passwordResetToken
        ? editor.passwordResetToken.hash
        : null,
    };
  }
}
