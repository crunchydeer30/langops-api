import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { GetEvaluationTasks } from 'libs/contracts/evaluation/queries/get-evaluation-tasks.query';

export class GetEvaluationTasksResponseDto extends createZodDto(
  GetEvaluationTasks.ResponseSchema,
) {}

zodToOpenAPI(GetEvaluationTasks.ResponseSchema);
zodToOpenAPI(GetEvaluationTasks.ResponseSchema);
