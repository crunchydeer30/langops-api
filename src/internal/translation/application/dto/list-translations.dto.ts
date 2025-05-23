import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { ListTranslationsQuery } from 'libs/contracts/translation/queries';

export class ListTranslationsQueryParamsDto extends createZodDto(
  ListTranslationsQuery.QueryParamsSchema,
) {}

export class ListTranslationsResponseDto extends createZodDto(
  ListTranslationsQuery.ResponseSchema,
) {}

zodToOpenAPI(ListTranslationsQuery.QueryParamsSchema);
zodToOpenAPI(ListTranslationsQuery.ResponseSchema);
