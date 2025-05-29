import { GetAvailableTasksQuery } from '@libs/contracts/translation-task/queries/get-available-tasks.query';
import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

export class GetAvailableTasksResponseDto extends createZodDto(
  GetAvailableTasksQuery.ResponseSchema,
) {}

zodToOpenAPI(GetAvailableTasksQuery.ResponseSchema);
