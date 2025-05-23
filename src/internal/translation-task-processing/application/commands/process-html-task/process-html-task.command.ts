import { ICommand } from '@nestjs/cqrs';

export interface IProcessHTMLTaskCommandProps {
  taskId: string;
}

export type IProcessHTMLTaskCommandResult = object;

export class ProcessHTMLTaskCommand implements ICommand {
  constructor(public readonly props: IProcessHTMLTaskCommandProps) {}
}
