import { ICommand } from '@nestjs/cqrs';

export interface IPickEvaluationTaskCommandProps {
  editorId: string;
  languagePairId: string;
}

export interface ISegmentResponse {
  segmentId: string;
  segmentOrder: number;
  segmentType: string;
  sourceContent: string;
  machineTranslatedContent: string | null;
}

export interface IPickEvaluationTaskResponse {
  translationTaskId: string;
  languagePairId: string;
  sourceLanguage: string;
  targetLanguage: string;
  isEvaluationTask: boolean;
  segments: ISegmentResponse[];
}

export class PickEvaluationTaskCommand implements ICommand {
  constructor(public readonly props: IPickEvaluationTaskCommandProps) {}
}
