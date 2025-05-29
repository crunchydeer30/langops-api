import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { SubmitTranslationTaskCommand } from 'libs/contracts/translation-task/commands/submit-translation-task.command';

export class SubmitTranslationTaskRequestDto extends createZodDto(
  SubmitTranslationTaskCommand.RequestSchema,
) {}

export class SubmitTranslationTaskResponseDto extends createZodDto(
  SubmitTranslationTaskCommand.ResponseSchema,
) {}

zodToOpenAPI(SubmitTranslationTaskCommand.RequestSchema);
zodToOpenAPI(SubmitTranslationTaskCommand.ResponseSchema);
