import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { LoginStaffCommand } from '@libs/contracts/auth';

export class LoginStaffBodyDto extends createZodDto(
  LoginStaffCommand.BodySchema,
) {}

export class LoginStaffResponseDto extends createZodDto(
  LoginStaffCommand.ResponseSchema,
) {}

zodToOpenAPI(LoginStaffCommand.BodySchema);
zodToOpenAPI(LoginStaffCommand.ResponseSchema);
