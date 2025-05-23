import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { CreateTranslationCommand } from 'libs/contracts/translation';

export class CreateTranslationRequestDto extends createZodDto(
  CreateTranslationCommand.RequestSchema,
) {}

export class CreateTranslationResponseDto extends createZodDto(
  CreateTranslationCommand.ResponseSchema,
) {}

zodToOpenAPI(CreateTranslationCommand.RequestSchema);
zodToOpenAPI(CreateTranslationCommand.ResponseSchema);
