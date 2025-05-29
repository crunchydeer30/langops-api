import { ICommand } from '@nestjs/cqrs';

export interface IPickEvaluationTaskCommandProps {
  editorId: string;
  languagePairId: string;
}

export interface IPickEvaluationTaskResponse {
  id: string;
  languagePairId: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalContent: string;
  status: string;
  currentStage: string;
  isEvaluationTask: boolean;
  wordCount: number;
}

export class PickEvaluationTaskCommand implements ICommand {
  constructor(public readonly props: IPickEvaluationTaskCommandProps) {}
}
