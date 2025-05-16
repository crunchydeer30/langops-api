import { RegisterCustomerCommand } from '@libs/contracts/auth';
import { createZodDto, zodToOpenAPI } from 'nestjs-zod';

export class RegisterCustomerBodyDto extends createZodDto(
  RegisterCustomerCommand.BodySchema,
) {}
export class RegisterCustomerResponseDto extends createZodDto(
  RegisterCustomerCommand.ResponseSchema,
) {}

zodToOpenAPI(RegisterCustomerCommand.BodySchema);
zodToOpenAPI(RegisterCustomerCommand.ResponseSchema);
