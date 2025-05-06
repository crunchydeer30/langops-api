import { Email } from '@common/domain/value-objects';
import { Editor } from '../entities/editor.entity';

export interface IEditorRepository {
  findById(id: string): Promise<Editor | null>;
  findByEmail(email: Email): Promise<Editor | null>;
  save(editor: Editor): Promise<void>;
}

export const IEditorRepository = Symbol('IEditorRepository');
