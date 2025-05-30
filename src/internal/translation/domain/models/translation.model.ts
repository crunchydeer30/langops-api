import {
  TranslationStage,
  TranslationTaskType,
  TranslationStatus,
} from '@prisma/client';

export class TranslationReadModel {
  id: string;
  formatType: TranslationTaskType;
  status: TranslationStatus;
  currentStage: TranslationStage | null;
  createdAt: Date;
  originalContent: string;
  translatedContent: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  customerId: string;

  constructor(data: Partial<TranslationReadModel>) {
    Object.assign(this, data);
  }
}
