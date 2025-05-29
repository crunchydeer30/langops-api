import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { StartReview } from 'libs/contracts/evaluation/commands/start-review.command';

export class StartReviewRequestDto extends createZodDto(
  StartReview.RequestSchema,
) {}

export class StartReviewResponseDto extends createZodDto(
  StartReview.ResponseSchema,
) {}

zodToOpenAPI(StartReview.RequestSchema);
zodToOpenAPI(StartReview.ResponseSchema);
