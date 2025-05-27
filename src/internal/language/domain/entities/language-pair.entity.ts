import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export interface ILanguagePair {
  id: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
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
  sourceLanguageCode: string;
  targetLanguageCode: string;
}

export class LanguagePair extends AggregateRoot implements ILanguagePair {
  public id: string;
  public sourceLanguageCode: string;
  public targetLanguageCode: string;
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
      sourceLanguageCode: args.sourceLanguageCode,
      targetLanguageCode: args.targetLanguageCode,
      sourceLanguage: {
        code: args.sourceLanguageCode,
        name: '',
      },
      targetLanguage: {
        code: args.targetLanguageCode,
        name: '',
      },
      createdAt: now,
      updatedAt: now,
    };

    return new LanguagePair(languagePairProps);
  }
}
