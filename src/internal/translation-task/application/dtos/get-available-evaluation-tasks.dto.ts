import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { GetAvailableEvaluationTasksQuery } from 'libs/contracts/translation-task/queries/get-available-evaluation-tasks.query';

export class GetAvailableEvaluationTasksParamsDto extends createZodDto(
  GetAvailableEvaluationTasksQuery.ParamsSchema,
) {}

export class GetAvailableEvaluationTasksResponseDto extends createZodDto(
  GetAvailableEvaluationTasksQuery.ResponseSchema,
) {}

zodToOpenAPI(GetAvailableEvaluationTasksQuery.ParamsSchema);
zodToOpenAPI(GetAvailableEvaluationTasksQuery.ResponseSchema);
