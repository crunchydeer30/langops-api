import { ICommand } from '@nestjs/cqrs';
import { TranslationTaskType } from '@prisma/client';

export interface ICreateTranslationTaskCommandProps {
  orderId: string;
  languagePairId: string;
  sourceContent: string;
  taskType: TranslationTaskType;
}

export interface ICreateTranslationTaskCommandResult {
  id: string;
}

export class CreateTranslationTaskCommand implements ICommand {
  constructor(public readonly props: ICreateTranslationTaskCommandProps) {}
}
