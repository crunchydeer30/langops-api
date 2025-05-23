import { z } from 'zod';
import {
  TranslationFormat,
  TranslationStage,
  TranslationStatus,
} from '../enums';

export const TranslationSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  format: z.nativeEnum(TranslationFormat),
  status: z.nativeEnum(TranslationStatus),
  currentStage: z.nativeEnum(TranslationStage),
  wordCount: z.number(),
  createdAt: z.date(),
  originalContent: z.string().optional(),
  translatedContent: z.string().optional().nullable(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  customerId: z.string().uuid(),
});
