import { z } from 'zod';
import { EVALUATION_HTTP_ROUTES } from '../controllers';

export namespace GetEvaluationTaskDetails {
  export const ENDPOINT = EVALUATION_HTTP_ROUTES.GET_EVALUATION_TASK_DETAILS;

  export const METHOD = 'GET';

  export const RequestSchema = z.object({});
  export type Request = z.infer<typeof RequestSchema>;

  export const SegmentSchema = z.object({
    id: z.string().uuid(),
    sourceText: z.string(),
    machineTranslatedText: z.string(),
    editedContent: z.string().nullable(),
    order: z.number(),
  });

  export const ResponseSchema = z.object({
    id: z.string().uuid(),
    rating: z.number().min(1).max(5).nullable(),
    feedback: z.string().nullable(),
    submissionDate: z.date().nullable(),
    segments: z.array(SegmentSchema),
  });

  export type Response = z.infer<typeof ResponseSchema>;
}
