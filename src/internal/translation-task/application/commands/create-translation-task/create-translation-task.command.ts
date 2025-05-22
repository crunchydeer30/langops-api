import { ICommand } from '@nestjs/cqrs';
import { TranslationTaskType } from '@prisma/client';
import type { OriginalStructure } from 'src/internal/translation-task-processing/domain/interfaces/original-structure.interface';

export interface ICreateTranslationTaskCommandProps {
  orderId: string;
  languagePairId: string;
  originalContent: string;
  originalStructure?: OriginalStructure;
  formatType: TranslationTaskType;
}

export interface ICreateTranslationTaskCommandResult {
  id: string;
}

export class CreateTranslationTaskCommand implements ICommand {
  constructor(public readonly props: ICreateTranslationTaskCommandProps) {}
}
