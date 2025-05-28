import { ICommand } from '@nestjs/cqrs';

export interface IInitiateEditorEvaluationCommandProps {
  editorId: string;
  languagePairId: string;
}

export interface IInitiateEditorEvaluationCommandResult {
  evaluationSetId: string;
}

export class InitiateEditorEvaluationCommand implements ICommand {
  constructor(public readonly props: IInitiateEditorEvaluationCommandProps) {}
}
