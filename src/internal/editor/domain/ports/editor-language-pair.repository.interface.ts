import { EditorLanguagePair } from '../entities/editor-language-pair.entity';

export interface IEditorLanguagePairRepository {
  findById(id: string): Promise<EditorLanguagePair | null>;
  findByEditorAndLanguagePair(
    editorId: string,
    languagePairId: string,
  ): Promise<EditorLanguagePair | null>;
  findByEditor(editorId: string): Promise<EditorLanguagePair[]>;
  findByLanguagePair(languagePairId: string): Promise<EditorLanguagePair[]>;
  save(editorLanguagePair: EditorLanguagePair): Promise<void>;
  saveMany(editorLanguagePairs: EditorLanguagePair[]): Promise<void>;
}
