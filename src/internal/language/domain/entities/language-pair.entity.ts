import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export interface ILanguagePair {
  id: string;
  sourceLanguageId: string;
  targetLanguageId: string;
  sourceLanguage: {
    code: string;
    name: string;
  };
  targetLanguage: {
    code: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ILanguagePairCreateArgs {
  id?: string;
  sourceLanguageId: string;
  targetLanguageId: string;
}

export class LanguagePair extends AggregateRoot implements ILanguagePair {
  public id: string;
  public sourceLanguageId: string;
  public targetLanguageId: string;
  public sourceLanguage: {
    code: string;
    name: string;
  };
  public targetLanguage: {
    code: string;
    name: string;
  };
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ILanguagePair) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: ILanguagePair): LanguagePair {
    return new LanguagePair(properties);
  }

  public static create(args: ILanguagePairCreateArgs): LanguagePair {
    const id = args.id ?? uuidv4();
    const now = new Date();

    const languagePairProps: ILanguagePair = {
      id,
      sourceLanguageId: args.sourceLanguageId,
      targetLanguageId: args.targetLanguageId,
      sourceLanguage: {
        code: '',
        name: '',
      },
      targetLanguage: {
        code: '',
        name: '',
      },
      createdAt: now,
      updatedAt: now,
    };

    return new LanguagePair(languagePairProps);
  }
}
