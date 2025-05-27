import { Injectable } from '@nestjs/common';
import { Language } from '../../domain/entities';
import { Language as PrismaLanguage } from '@prisma/client';

@Injectable()
export class LanguageMapper {
  toDomain(prismaLanguage: PrismaLanguage): Language {
    return Language.reconstitute({
      code: prismaLanguage.code,
      name: prismaLanguage.name,
      createdAt: prismaLanguage.createdAt,
      updatedAt: prismaLanguage.updatedAt,
    });
  }

  toPersistence(language: Language): {
    code: string;
    name: string;
  } {
    return {
      code: language.code,
      name: language.name,
    };
  }
}
