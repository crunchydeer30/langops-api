import { Language } from '../entities';

export interface ILanguageRepository {
  findById(id: string): Promise<Language | null>;
  findByCode(code: string): Promise<Language | null>;
  findAll(): Promise<Language[]>;
  save(language: Language): Promise<Language>;
  delete(id: string): Promise<void>;
}
