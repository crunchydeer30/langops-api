export interface BaseProcessTaskCommandParams {
  taskId: string;
}

import { TranslationTaskSegment } from 'src/internal/translation-task-processing/domain/entities/translation-task-segment.entity';
import { SensitiveDataMapping } from 'src/internal/translation-task-processing/domain/entities/sensitive-data-mapping.entity';
import { OriginalStructure } from 'src/internal/translation-task-processing/domain/interfaces/original-structure.interface';

export interface BaseProcessTaskResponse {
  taskId: string;
  segments: TranslationTaskSegment[];
  sensitiveDataMappings: SensitiveDataMapping[];
  originalStructure: OriginalStructure | null;
}

export abstract class BaseProcessTaskCommand {
  constructor(public readonly params: BaseProcessTaskCommandParams) {}
}
