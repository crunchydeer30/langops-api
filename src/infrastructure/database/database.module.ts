import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import type { TranslationSpecialTokenMap as ITranslationSpecialTokenMap } from 'src/internal/translation-task-processing/domain/interfaces/translation-segment-token-map.interface';
import type { OriginalStructure as IOriginalStructure } from 'src/internal/translation-task-processing/domain/interfaces/original-structure.interface';
import type { FormatMetadata as IFormatMetadata } from 'src/internal/translation-task-processing/domain/interfaces/format-metadata.interface';

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
    export type OriginalStructure = IOriginalStructure;
    export type FormatMetadata = IFormatMetadata;
  }
}
