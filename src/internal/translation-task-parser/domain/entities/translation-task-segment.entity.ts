import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { TranslationSpecialTokenMap } from '../interfaces/translation-segment-token-map.interface';

export interface ITranslationTaskSegment {
  id: string;
  translationTaskId: string;
  segmentOrder: number;
  sourceContent: string;
  machineTranslatedContent: string | null;
  editedContent: string | null;
  specialTokensMap: TranslationSpecialTokenMap | null;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranslationTaskSegmentCreateArgs {
  id?: string;
  translationTaskId: string;
  segmentOrder: number;
  sourceContent: string;
  specialTokensMap?: TranslationSpecialTokenMap;
  metadata?: Record<string, any> | null;
}

export class TranslationTaskSegment
  extends AggregateRoot
  implements ITranslationTaskSegment
{
  private logger = new Logger(TranslationTaskSegment.name);

  public id: string;
  public translationTaskId: string;
  public segmentOrder: number;
  public sourceContent: string;
  public machineTranslatedContent: string | null;
  public editedContent: string | null;
  public specialTokensMap: TranslationSpecialTokenMap;
  public metadata: Record<string, any> | null;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ITranslationTaskSegment) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(
    properties: ITranslationTaskSegment,
  ): TranslationTaskSegment {
    return new TranslationTaskSegment(properties);
  }

  public static create(
    args: ITranslationTaskSegmentCreateArgs,
  ): TranslationTaskSegment {
    const id = args.id ?? uuidv4();
    const now = new Date();

    const {
      translationTaskId,
      segmentOrder,
      sourceContent,
      specialTokensMap = {},
      metadata = null,
    } = args;

    const segment = new TranslationTaskSegment({
      id,
      translationTaskId,
      segmentOrder,
      sourceContent,
      machineTranslatedContent: null,
      editedContent: null,
      specialTokensMap,
      metadata,
      createdAt: now,
      updatedAt: now,
    });

    return segment;
  }
}
