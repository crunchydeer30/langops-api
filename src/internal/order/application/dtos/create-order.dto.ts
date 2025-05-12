import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { CreateOrderCommand } from 'libs/contracts/order';

export class CreateOrderBodyDto extends createZodDto(
  CreateOrderCommand.BodySchema,
) {}

export class CreateOrderResponseDto extends createZodDto(
  CreateOrderCommand.ResponseSchema,
) {}

zodToOpenAPI(CreateOrderCommand.BodySchema);
zodToOpenAPI(CreateOrderCommand.ResponseSchema);
