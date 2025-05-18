import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TranslationTaskType } from '@prisma/client';

export class StartParsingDto {
  @IsNotEmpty()
  @IsString()
  taskId: string;

  @IsNotEmpty()
  @IsEnum(TranslationTaskType, {
    message: 'taskType must be a valid TranslationTaskType',
  })
  taskType: string;
}
