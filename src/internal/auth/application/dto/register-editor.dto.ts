import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { RegisterEditorCommand } from '@libs/contracts/auth';

export class RegisterEditorBodyDto extends createZodDto(
  RegisterEditorCommand.BodySchema,
) {}

export class RegisterEditorResponseDto extends createZodDto(
  RegisterEditorCommand.ResponseSchema,
) {}

zodToOpenAPI(RegisterEditorCommand.BodySchema);
zodToOpenAPI(RegisterEditorCommand.ResponseSchema);
