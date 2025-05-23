import {
  TranslationStage,
  TranslationTaskStatus,
  TranslationTaskType,
} from '@prisma/client';

export class TranslationReadModel {
  id: string;
  orderId: string;
  formatType: TranslationTaskType;
  status: TranslationTaskStatus;
  currentStage: TranslationStage;
  wordCount: number;
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
