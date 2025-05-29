import { ApiProperty } from '@nestjs/swagger';
import { IEvaluationTaskResponse } from '../queries/get-evaluation-tasks/get-evaluation-tasks.query';

export class EvaluationTaskResponseDto implements IEvaluationTaskResponse {
  @ApiProperty({
    description: 'The ID of the evaluation task',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'The rating given to the task (1-5) or null if not rated',
    nullable: true,
  })
  rating: number | null;

  @ApiProperty({
    description: 'Feedback from the senior editor, or null if not provided',
    nullable: true,
  })
  feedback: string | null;

  @ApiProperty({
    description: 'The date when the task was created',
    nullable: true,
  })
  submissionDate: Date | null;
}

export class GetEvaluationTasksResponseDto extends Array<EvaluationTaskResponseDto> {}
