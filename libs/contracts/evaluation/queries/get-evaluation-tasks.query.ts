import { z } from 'zod';

export namespace GetEvaluationTasks {
  export const ENDPOINT = '/:evaluationId/tasks';
  export const METHOD = 'GET';

  export const RequestSchema = z.object({});
  export type Request = z.infer<typeof RequestSchema>;

  export const TaskSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(['PENDING', 'SUBMITTED', 'GRADED']),
    submissionDate: z.date().nullable().optional(),
  });

  export const ResponseSchema = z.array(TaskSchema);
  export type Response = z.infer<typeof ResponseSchema>;
}
