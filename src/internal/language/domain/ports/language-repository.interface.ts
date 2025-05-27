import { Language } from '../entities';

export interface ILanguageRepository {
  findByCode(code: string): Promise<Language | null>;
  findAll(): Promise<Language[]>;
  save(language: Language): Promise<Language>;
  delete(code: string): Promise<void>;
}
