import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { LoginCustomerCommand } from 'libs/contracts/auth';

export class LoginCustomerBodyDto extends createZodDto(
  LoginCustomerCommand.BodySchema,
) {}
export class LoginCustomerResponseDto extends createZodDto(
  LoginCustomerCommand.ResponseSchema,
) {}

zodToOpenAPI(LoginCustomerCommand.BodySchema);
zodToOpenAPI(LoginCustomerCommand.ResponseSchema);
