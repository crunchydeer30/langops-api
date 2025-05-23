import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { GetTranslationQuery } from 'libs/contracts/translation';

export class GetTranslationParamsDto extends createZodDto(
  GetTranslationQuery.ParamsSchema,
) {}

export class GetTranslationResponseDto extends createZodDto(
  GetTranslationQuery.ResponseSchema,
) {}

zodToOpenAPI(GetTranslationQuery.ParamsSchema);
zodToOpenAPI(GetTranslationQuery.ResponseSchema);
