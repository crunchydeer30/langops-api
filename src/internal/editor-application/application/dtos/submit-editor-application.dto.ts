import { SubmitEditorApplicationCommand } from '@libs/contracts/editor-application';
import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

export class SubmitEditorApplicationBodyDto extends createZodDto(
  SubmitEditorApplicationCommand.BodySchema,
) {}

export class SubmitEditorApplicationResponseDto extends createZodDto(
  SubmitEditorApplicationCommand.ResponseSchema,
) {}

zodToOpenAPI(SubmitEditorApplicationCommand.BodySchema);
zodToOpenAPI(SubmitEditorApplicationCommand.ResponseSchema);
