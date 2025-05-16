import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class ParseEmailDto {
  @IsNotEmpty()
  @IsString()
  emailContent: string;

  @IsOptional()
  @IsUUID()
  translationTaskId?: string;
}
