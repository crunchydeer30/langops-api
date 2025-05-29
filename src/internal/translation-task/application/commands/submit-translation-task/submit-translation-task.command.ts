import { ICommand } from '@nestjs/cqrs';

export interface ISubmitTranslationTaskSegment {
  segmentId: string;
  editedContent: string;
}

export interface ISubmitTranslationTaskCommandProps {
  editorId: string;
  taskId: string;
  segments: ISubmitTranslationTaskSegment[];
}

export interface ISubmitTranslationTaskResponse {
  success: boolean;
  translationTaskId: string;
}

export class SubmitTranslationTaskCommand implements ICommand {
  constructor(public readonly props: ISubmitTranslationTaskCommandProps) {}
}
