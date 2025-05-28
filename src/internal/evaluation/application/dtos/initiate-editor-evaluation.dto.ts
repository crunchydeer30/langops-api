import { InitiateEditorEvaluationCommand } from '@libs/contracts/evaluation/commands';
import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

export class InitiateEditorEvaluationBodyDto extends createZodDto(
  InitiateEditorEvaluationCommand.BodySchema,
) {}

export class InitiateEditorEvaluationResponseDto extends createZodDto(
  InitiateEditorEvaluationCommand.ResponseSchema,
) {}

zodToOpenAPI(InitiateEditorEvaluationCommand.BodySchema);
zodToOpenAPI(InitiateEditorEvaluationCommand.ResponseSchema);
