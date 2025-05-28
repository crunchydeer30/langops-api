import { EVALUATION_HTTP_ROUTES } from '../controllers';
import { z } from 'zod';

export namespace InitiateEditorEvaluationCommand {
  export const ENDPOINT = EVALUATION_HTTP_ROUTES.INITIATE_EVALUATION;
  export const METHOD = 'POST';

  export const BodySchema = z.object({
    languagePairId: z.string().uuid(),
  });
  export type BodySchema = z.infer<typeof BodySchema>;

  export const ResponseSchema = z.object({
    evaluationSetId: z.string().uuid(),
  });
  export type ResponseSchema = z.infer<typeof ResponseSchema>;
}
