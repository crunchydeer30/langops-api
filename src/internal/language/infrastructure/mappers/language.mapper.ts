import { Injectable } from '@nestjs/common';
import { Language } from '../../domain/entities';
import { Language as PrismaLanguage } from '@prisma/client';

@Injectable()
export class LanguageMapper {
  toDomain(prismaLanguage: PrismaLanguage): Language {
    return Language.reconstitute({
      id: prismaLanguage.id,
      code: prismaLanguage.code,
      name: prismaLanguage.name,
      createdAt: prismaLanguage.createdAt,
      updatedAt: prismaLanguage.updatedAt,
    });
  }

  toPersistence(language: Language): {
    id: string;
    code: string;
    name: string;
  } {
    return {
      id: language.id,
      code: language.code,
      name: language.name,
    };
  }
}
