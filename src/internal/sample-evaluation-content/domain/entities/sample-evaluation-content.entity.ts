import { AggregateRoot } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TranslationTaskType } from '@prisma/client';

export interface ISampleEvaluationContent {
  id: string;
  content: string;
  formatType: TranslationTaskType;
  languagePairId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISampleEvaluationContentCreateArgs {
  id?: string;
  content: string;
  formatType: TranslationTaskType;
  languagePairId: string;
}

export class SampleEvaluationContent
  extends AggregateRoot
  implements ISampleEvaluationContent
{
  private readonly logger = new Logger(SampleEvaluationContent.name);

  public id: string;
  public content: string;
  public formatType: TranslationTaskType;
  public languagePairId: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ISampleEvaluationContent) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(
    properties: ISampleEvaluationContent,
  ): SampleEvaluationContent {
    return new SampleEvaluationContent(properties);
  }

  public static create(
    args: ISampleEvaluationContentCreateArgs,
  ): SampleEvaluationContent {
    const id = args.id || uuidv4();
    const now = new Date();

    const sampleContent = new SampleEvaluationContent({
      id,
      content: args.content,
      formatType: args.formatType,
      languagePairId: args.languagePairId,
      createdAt: now,
      updatedAt: now,
    });

    return sampleContent;
  }
}
