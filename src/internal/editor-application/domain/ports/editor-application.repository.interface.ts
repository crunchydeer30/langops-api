import { Email } from '@common/domain/value-objects';
import { EditorApplication } from '../entities/editor-application.entity';

export interface IEditorApplicationRepository {
  findById(id: string): Promise<EditorApplication | null>;
  findByEmail(email: Email): Promise<EditorApplication | null>;
  findByRegistrationToken(tokenHash: string): Promise<EditorApplication | null>;
  save(application: EditorApplication): Promise<void>;
  saveWithLanguagePairs(application: EditorApplication): Promise<void>;
}
