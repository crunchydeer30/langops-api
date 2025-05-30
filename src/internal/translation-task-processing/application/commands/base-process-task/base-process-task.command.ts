import { ContentSegmentType } from '@prisma/client';
import { TranslationSpecialTokenMap } from 'src/internal/translation-task-processing/domain/interfaces/translation-segment-token-map.interface';
import { FormatMetadata } from 'src/internal/translation-task-processing/domain/interfaces/format-metadata.interface';
import { OriginalStructure } from 'src/internal/translation-task-processing/domain/interfaces/original-structure.interface';

export interface BaseProcessTaskCommandParams {
  taskId: string;
}

export interface SegmentArgs {
  id: string;
  translationTaskId: string;
  segmentOrder: number;
  segmentType: ContentSegmentType;
  sourceContent: string;
  machineTranslatedContent?: string | null;
  editedContent?: string | null;
  specialTokensMap?: TranslationSpecialTokenMap | null;
  formatMetadata?: FormatMetadata | null;
}

export interface SensitiveDataMappingArgs {
  id: string;
  translationTaskId: string;
  tokenIdentifier: string;
  sensitiveType: string;
  originalValue: string;
}

export interface BaseProcessTaskResponse {
  taskId: string;
  segmentArgs: SegmentArgs[];
  sensitiveDataMappingArgs: SensitiveDataMappingArgs[];
  originalStructure: OriginalStructure | null;
}

export abstract class BaseProcessTaskCommand {
  constructor(public readonly params: BaseProcessTaskCommandParams) {}
}
