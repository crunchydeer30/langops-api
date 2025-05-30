import { z } from 'zod';
import { EVALUATION_HTTP_ROUTES } from '../controllers/evaluation.http.routes';

export namespace RateEvaluationTaskCommand {
  export const ENDPOINT = (evaluationId: string, taskId: string) =>
    EVALUATION_HTTP_ROUTES.RATE_TASK(evaluationId, taskId);
  export const METHOD = 'POST';

  export const RequestSchema = z.object({
    rating: z.number().min(1).max(5).int(),
    feedback: z.string().min(1, 'Feedback is required'),
  });
  export type Request = z.infer<typeof RequestSchema>;

  export const ResponseSchema = z.object({
    id: z.string().uuid(),
    rating: z.number().min(0).max(5).int(),
    seniorEditorFeedback: z.string().nullable(),
    taskId: z.string().uuid(),
    evaluationSetId: z.string().uuid(),
    success: z.boolean(),
  });

  export type Response = z.infer<typeof ResponseSchema>;
}
