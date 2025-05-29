import { GetAvailableTasksQuery } from '@libs/contracts/translation-task/queries/get-available-tasks.query';
import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

export class GetAvailableTasksParamsDto extends createZodDto(
  GetAvailableTasksQuery.ParamsSchema,
) {}

export class GetAvailableTasksResponseDto extends createZodDto(
  GetAvailableTasksQuery.ResponseSchema,
) {}

zodToOpenAPI(GetAvailableTasksQuery.ParamsSchema);
zodToOpenAPI(GetAvailableTasksQuery.ResponseSchema);
