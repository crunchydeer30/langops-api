import { z } from 'zod';
import { EVALUATION_HTTP_ROUTES } from '../controllers';

export namespace GetEvaluationTasks {
  export const ENDPOINT = EVALUATION_HTTP_ROUTES.GET_EVALUATION_TASKS;
  export const METHOD = 'GET';

  export const RequestSchema = z.object({});
  export type Request = z.infer<typeof RequestSchema>;

  export const TaskSchema = z.object({
    id: z.string().uuid(),
    rating: z.number().min(1).max(5).nullable(),
    feedback: z.string().nullable(),
    submissionDate: z.date().nullable(),
  });

  export const ResponseSchema = z.array(TaskSchema);
  export type Response = z.infer<typeof ResponseSchema>;
}
