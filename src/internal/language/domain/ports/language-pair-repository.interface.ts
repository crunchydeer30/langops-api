import { LanguagePair } from '../entities';

export interface ILanguagePairRepository {
  findById(id: string): Promise<LanguagePair | null>;
  findManyById(ids: string[]): Promise<LanguagePair[]>;
  findByLanguages(
    sourceLanguageCode: string,
    targetLanguageCode: string,
  ): Promise<LanguagePair | null>;
  findByLanguageCodes(
    sourceLanguageCode: string,
    targetLanguageCode: string,
  ): Promise<LanguagePair | null>;
  findAll(): Promise<LanguagePair[]>;
  findAcceptingEditors(): Promise<LanguagePair[]>;
  save(languagePair: LanguagePair): Promise<LanguagePair>;
  delete(id: string): Promise<void>;
}
