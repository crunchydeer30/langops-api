import { z } from 'zod';
import { EVALUATION_HTTP_ROUTES } from '../controllers';

export namespace StartReview {
  export const ENDPOINT = EVALUATION_HTTP_ROUTES.START_REVIEW;
  export const METHOD = 'POST';

  // Empty request body since we'll get evaluationId from URL params
  export const RequestSchema = z.object({});
  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = z.object({
    success: z.boolean(),
    evaluationSetId: z.string().uuid(),
  });
  export type Response = z.infer<typeof ResponseSchema>;
}
