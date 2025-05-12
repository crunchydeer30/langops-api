import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { ApproveEditorApplicationCommand } from '@libs/contracts/editor-application';

export class ApproveEditorApplicationParamsDto extends createZodDto(
  ApproveEditorApplicationCommand.ParamsSchema,
) {}

export class ApproveEditorApplicationResponseDto extends createZodDto(
  ApproveEditorApplicationCommand.ResponseSchema,
) {}

zodToOpenAPI(ApproveEditorApplicationCommand.ParamsSchema);
zodToOpenAPI(ApproveEditorApplicationCommand.ResponseSchema);
