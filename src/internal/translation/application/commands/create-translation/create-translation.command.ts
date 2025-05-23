import { TranslationFormat } from '@libs/contracts/translation/enums';
import { ICommand } from '@nestjs/cqrs';

export class CreateTranslationCommand implements ICommand {
  constructor(
    public readonly payload: {
      customerId: string;
      sourceLanguage: string;
      targetLanguage: string;
      text: string;
      format: TranslationFormat;
    },
  ) {}
}
