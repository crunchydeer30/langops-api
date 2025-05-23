import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { GetTranslationByIdQuery } from 'libs/contracts/translation';

export class GetTranslationByIdParamsDto extends createZodDto(
  GetTranslationByIdQuery.ParamsSchema,
) {}

export class GetTranslationByIdResponseDto extends createZodDto(
  GetTranslationByIdQuery.ResponseSchema,
) {}

zodToOpenAPI(GetTranslationByIdQuery.ParamsSchema);
zodToOpenAPI(GetTranslationByIdQuery.ResponseSchema);
