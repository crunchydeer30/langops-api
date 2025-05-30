import { ICommand } from '@nestjs/cqrs';

export class ReconstructHtmlTaskCommand implements ICommand {
  constructor(public readonly taskId: string) {}
}
