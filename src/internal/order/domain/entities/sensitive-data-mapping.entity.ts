import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { ISensitiveDataTokenMap } from '../types/sensitive-data.types';

export interface ISensitiveDataMapping {
  id: string;
  orderId: string;
  tokenMap: ISensitiveDataTokenMap;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISensitiveDataMappingCreateArgs {
  orderId: string;
  tokenMap: ISensitiveDataTokenMap;
}

export class SensitiveDataMapping extends AggregateRoot {
  public readonly id: string;
  public readonly orderId: string;
  public tokenMap: ISensitiveDataTokenMap;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: ISensitiveDataMapping) {
    super();
    this.id = props.id;
    this.orderId = props.orderId;
    this.tokenMap = props.tokenMap;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(
    args: ISensitiveDataMappingCreateArgs,
  ): SensitiveDataMapping {
    const now = new Date();
    const mapping = new SensitiveDataMapping({
      id: uuidv4(),
      orderId: args.orderId,
      tokenMap: args.tokenMap,
      createdAt: now,
      updatedAt: now,
    });
    return mapping;
  }

  public updateTokenMap(tokenMap: ISensitiveDataTokenMap) {
    this.tokenMap = tokenMap;
    this.updatedAt = new Date();
  }
}
