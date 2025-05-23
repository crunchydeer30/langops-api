import { z } from 'zod';
import { TranslationStatus } from '../enums';

export const TranslationSchema = z.object({
  uuid: z.string().uuid(),
  orderId: z.string().uuid(),
  price: z.number().default(0),
  source_language: z.string(),
  target_language: z.string(),
  text: z.string(),
  text_format: z.string(),
  result: z.string().nullable(),
  status: z.nativeEnum(TranslationStatus),
});
