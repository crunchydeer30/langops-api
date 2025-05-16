import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { CreateEmailTranslationOrderCommand } from 'libs/contracts/order';

export class CreateEmailTranslationOrderBodyDto extends createZodDto(
  CreateEmailTranslationOrderCommand.BodySchema,
) {}

export class CreateEmailTranslationOrderResponseDto extends createZodDto(
  CreateEmailTranslationOrderCommand.ResponseSchema,
) {}

zodToOpenAPI(CreateEmailTranslationOrderCommand.BodySchema);
zodToOpenAPI(CreateEmailTranslationOrderCommand.ResponseSchema);
