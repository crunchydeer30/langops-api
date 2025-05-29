import { z } from 'zod';
import { EVALUATION_HTTP_ROUTES } from '../controllers';

export namespace GetPendingReviewSets {
  export const ENDPOINT = EVALUATION_HTTP_ROUTES.PENDING_REVIEW;
  export const METHOD = 'GET';

  export const QueryParamsSchema = z.object({
    languagePairId: z.string().uuid().optional(),
  });
  export type QueryParams = z.infer<typeof QueryParamsSchema>;

  export const ResponseItemSchema = z.object({
    id: z.string().uuid(),
    languagePairId: z.string().uuid(),
    createdAt: z.string().datetime(),
  });

  export const ResponseSchema = z.array(ResponseItemSchema);
  export type Response = z.infer<typeof ResponseSchema>;
}
