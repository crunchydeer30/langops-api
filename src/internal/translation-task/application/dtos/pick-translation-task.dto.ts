import { createZodDto, zodToOpenAPI } from 'nestjs-zod';
import { PickTranslationTaskCommand } from 'libs/contracts/translation-task/commands/pick-translation-task.command';

export class PickTranslationTaskRequestDto extends createZodDto(
  PickTranslationTaskCommand.RequestSchema,
) {}

export class PickTranslationTaskResponseDto extends createZodDto(
  PickTranslationTaskCommand.ResponseSchema,
) {}

zodToOpenAPI(PickTranslationTaskCommand.RequestSchema);
zodToOpenAPI(PickTranslationTaskCommand.ResponseSchema);
