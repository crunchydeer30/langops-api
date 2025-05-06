import { IsEmail, IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitEditorApplicationDto {
  @ApiProperty({
    description: 'Email of the applicant',
    example: 'applicant@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description:
      'Array of language pair IDs that the editor wants to qualify for',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  languagePairIds: string[];
}
