import { ICommand } from '@nestjs/cqrs';

export class PickTranslationTaskCommand implements ICommand {
  constructor(
    public readonly payload: {
      editorId: string;
      languagePairId: string;
    },
  ) {}
}
