import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { LoginEditorCommand } from '@libs/contracts/auth';

export class LoginEditorBodyDto extends createZodDto(
  LoginEditorCommand.BodySchema,
) {}

export class LoginEditorResponseDto extends createZodDto(
  LoginEditorCommand.ResponseSchema,
) {}

zodToOpenAPI(LoginEditorCommand.BodySchema);
zodToOpenAPI(LoginEditorCommand.ResponseSchema);
