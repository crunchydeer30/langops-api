import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { RateEvaluationTaskCommand } from 'libs/contracts/evaluation/commands/rate-evaluation-task.command';

export class RateEvaluationTaskRequestDto extends createZodDto(
  RateEvaluationTaskCommand.RequestSchema,
) {}

export class RateEvaluationTaskResponseDto extends createZodDto(
  RateEvaluationTaskCommand.ResponseSchema,
) {}

zodToOpenAPI(RateEvaluationTaskCommand.RequestSchema);
zodToOpenAPI(RateEvaluationTaskCommand.ResponseSchema);
