import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { GetEvaluationTaskDetails } from 'libs/contracts/evaluation/queries/get-evaluation-task-details.query';

export class EvaluationTaskSegmentDto extends createZodDto(
  GetEvaluationTaskDetails.SegmentSchema,
) {}

export class GetEvaluationTaskDetailsResponseDto extends createZodDto(
  GetEvaluationTaskDetails.ResponseSchema,
) {}

zodToOpenAPI(GetEvaluationTaskDetails.SegmentSchema);
zodToOpenAPI(GetEvaluationTaskDetails.ResponseSchema);
