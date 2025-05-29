import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { GetPendingReviewSets } from 'libs/contracts/evaluation/queries/get-pending-review-sets.query';

export class GetPendingReviewSetsParamsDto extends createZodDto(
  GetPendingReviewSets.QueryParamsSchema,
) {}

export class GetPendingReviewSetsResponseDto extends createZodDto(
  GetPendingReviewSets.ResponseSchema,
) {}

zodToOpenAPI(GetPendingReviewSets.QueryParamsSchema);
zodToOpenAPI(GetPendingReviewSets.ResponseSchema);
