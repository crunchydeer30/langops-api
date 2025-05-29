import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { PickEvaluationTaskCommand } from 'libs/contracts/translation-task/commands/pick-evaluation-task.command';

export class PickEvaluationTaskRequestDto extends createZodDto(
  PickEvaluationTaskCommand.RequestSchema,
) {}

export class PickEvaluationTaskResponseDto extends createZodDto(
  PickEvaluationTaskCommand.ResponseSchema,
) {}

zodToOpenAPI(PickEvaluationTaskCommand.RequestSchema);
zodToOpenAPI(PickEvaluationTaskCommand.ResponseSchema);
