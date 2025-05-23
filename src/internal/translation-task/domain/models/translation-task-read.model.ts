import {
  TranslationStage,
  TranslationTaskStatus,
  TranslationTaskType,
} from '@prisma/client';

export class TranslationTaskReadModel {
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

  constructor(data: Partial<TranslationTaskReadModel>) {
    Object.assign(this, data);
  }
}
