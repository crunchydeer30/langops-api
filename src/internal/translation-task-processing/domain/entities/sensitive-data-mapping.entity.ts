import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

export interface ISensitiveDataMapping {
  id: string;
  translationTaskId: string;
  tokenIdentifier: string;
  sensitiveType: string;
  originalValue: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISensitiveDataMappingCreateArgs {
  id?: string;
  translationTaskId: string;
  tokenIdentifier: string;
  sensitiveType: string;
  originalValue: string;
}

export class SensitiveDataMapping
  extends AggregateRoot
  implements ISensitiveDataMapping
{
  private logger = new Logger(SensitiveDataMapping.name);

  public id: string;
  public translationTaskId: string;
  public tokenIdentifier: string;
  public sensitiveType: string;
  public originalValue: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ISensitiveDataMapping) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(
    properties: ISensitiveDataMapping,
  ): SensitiveDataMapping {
    return new SensitiveDataMapping(properties);
  }

  public static create(
    args: ISensitiveDataMappingCreateArgs,
  ): SensitiveDataMapping {
    const id = args.id ?? uuidv4();
    const now = new Date();

    const { translationTaskId, tokenIdentifier, sensitiveType, originalValue } =
      args;

    const mapping = new SensitiveDataMapping({
      id,
      translationTaskId,
      tokenIdentifier,
      sensitiveType,
      originalValue,
      createdAt: now,
      updatedAt: now,
    });

    return mapping;
  }
}
