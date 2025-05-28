import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { EditorLanguagePairQualificationStatus } from '@prisma/client';

export interface IEditorLanguagePair {
  id: string;
  editorId: string;
  languagePairId: string;
  qualificationStatus: EditorLanguagePairQualificationStatus;
  rating?: number | null;
  lastEvaluationAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEditorLanguagePairCreateArgs {
  id?: string;
  editorId: string;
  languagePairId: string;
  qualificationStatus?: EditorLanguagePairQualificationStatus;
}

export class EditorLanguagePair
  extends AggregateRoot
  implements IEditorLanguagePair
{
  private readonly logger = new Logger(EditorLanguagePair.name);

  public id: string;
  public editorId: string;
  public languagePairId: string;
  public qualificationStatus: EditorLanguagePairQualificationStatus;
  public rating?: number | null;
  public lastEvaluationAt?: Date | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: IEditorLanguagePair) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(
    properties: IEditorLanguagePair,
  ): EditorLanguagePair {
    return new EditorLanguagePair(properties);
  }

  public static create(
    args: IEditorLanguagePairCreateArgs,
  ): EditorLanguagePair {
    const id = args.id ?? uuidv4();
    const now = new Date();

    const editorLanguagePairProps: IEditorLanguagePair = {
      id,
      editorId: args.editorId,
      languagePairId: args.languagePairId,
      qualificationStatus:
        args.qualificationStatus ??
        EditorLanguagePairQualificationStatus.INITIAL_EVALUATION_REQUIRED,
      rating: null,
      lastEvaluationAt: null,
      createdAt: now,
      updatedAt: now,
    };

    return new EditorLanguagePair(editorLanguagePairProps);
  }

  public updateQualificationStatus(
    status: EditorLanguagePairQualificationStatus,
  ): void {
    this.qualificationStatus = status;
    this.updatedAt = new Date();

    this.logger.log(
      `Updated qualification status for editor ${this.editorId} and language pair ${this.languagePairId} to ${status}`,
    );
  }

  public recordEvaluation(rating: number): void {
    this.rating = rating;
    this.lastEvaluationAt = new Date();
    this.updatedAt = new Date();

    this.logger.log(
      `Recorded evaluation for editor ${this.editorId} and language pair ${this.languagePairId} with rating ${rating}`,
    );
  }
}
