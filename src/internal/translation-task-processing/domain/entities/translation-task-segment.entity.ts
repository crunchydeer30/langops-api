import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';
import { TranslationSpecialTokenMap } from '../interfaces/translation-segment-token-map.interface';
import { FormatMetadata } from '../interfaces/format-metadata.interface';
import { ContentSegmentType } from '@prisma/client';

export interface ITranslationTaskSegment {
  id: string;
  translationTaskId: string;
  segmentOrder: number;
  segmentType: ContentSegmentType;
  sourceContent: string;
  anonymizedContent?: string | null;
  machineTranslatedContent?: string | null;
  editedContent?: string | null;
  deanonymizedContent?: string | null;
  specialTokensMap?: TranslationSpecialTokenMap | null;
  formatMetadata?: FormatMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranslationTaskSegmentCreateArgs {
  id?: string;
  translationTaskId: string;
  segmentOrder: number;
  segmentType: ContentSegmentType;
  sourceContent: string;
  anonymizedContent?: string | null;
  machineTranslatedContent?: string | null;
  editedContent?: string | null;
  deanonymizedContent?: string | null;
  specialTokensMap?: TranslationSpecialTokenMap;
  formatMetadata?: FormatMetadata | null;
}

export class TranslationTaskSegment
  extends AggregateRoot
  implements ITranslationTaskSegment
{
  private logger = new Logger(TranslationTaskSegment.name);

  public id: string;
  public translationTaskId: string;
  public segmentOrder: number;
  public segmentType: ContentSegmentType;
  public sourceContent: string;
  public anonymizedContent: string | null;
  public machineTranslatedContent: string | null;
  public editedContent: string | null;
  public deanonymizedContent: string | null;
  public specialTokensMap: TranslationSpecialTokenMap | null;
  public formatMetadata: FormatMetadata | null;
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
      segmentType,
      sourceContent,
      anonymizedContent = null,
      machineTranslatedContent = null,
      editedContent = null,
      deanonymizedContent = null,
      specialTokensMap = {},
      formatMetadata = null,
    } = args;

    const segment = new TranslationTaskSegment({
      id,
      translationTaskId,
      segmentOrder,
      segmentType,
      sourceContent,
      anonymizedContent,
      machineTranslatedContent,
      editedContent,
      deanonymizedContent,
      specialTokensMap,
      formatMetadata,
      createdAt: now,
      updatedAt: now,
    });

    return segment;
  }
}
