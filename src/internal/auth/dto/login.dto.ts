import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { LoginCommand } from 'libs/contracts/auth';

export class LoginBodyDto extends createZodDto(LoginCommand.BodySchema) {}
export class LoginResponseDto extends createZodDto(
  LoginCommand.ResponseSchema,
) {}

zodToOpenAPI(LoginCommand.BodySchema);
zodToOpenAPI(LoginCommand.ResponseSchema);
