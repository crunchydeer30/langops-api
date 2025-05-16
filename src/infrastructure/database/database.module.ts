import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { TranslationSpecialTokenMap as ITranslationSpecialTokenMap } from 'src/internal/translation-task-parsing/domain/interfaces/translation-segment-token-map.interface';
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

// Prisma json types
declare global {
  namespace PrismaJson {
    export type TranslationSpecialTokenMap = ITranslationSpecialTokenMap;
  }
}
