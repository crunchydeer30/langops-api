import { z } from 'zod';
import { TranslationFormat, TranslationStatus } from '../enums';

export const TranslationSchema = z.object({
  id: z.string().uuid(),
  format: z.nativeEnum(TranslationFormat),
  status: z.nativeEnum(TranslationStatus),
  createdAt: z.date(),
  originalContent: z.string().optional(),
  translatedContent: z.string().optional().nullable(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  customerId: z.string().uuid(),
});
