import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

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
  isAcceptingEditors: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILanguagePairCreateArgs {
  id?: string;
  sourceLanguageCode: string;
  targetLanguageCode: string;
}

export class LanguagePair extends AggregateRoot implements ILanguagePair {
  private readonly logger = new Logger(LanguagePair.name);

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
  public isAcceptingEditors: boolean;
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
      isAcceptingEditors: false,
      createdAt: now,
      updatedAt: now,
    };

    return new LanguagePair(languagePairProps);
  }

  public startAcceptingEditors(): void {
    if (this.isAcceptingEditors) {
      this.logger.log(`Language pair ${this.id} is already accepting editors`);
      return;
    }

    this.isAcceptingEditors = true;
    this.updatedAt = new Date();

    this.logger.log(
      `Language pair ${this.id} (${this.sourceLanguageCode}-${this.targetLanguageCode}) is now accepting editors`,
    );
  }

  public stopAcceptingEditors(): void {
    if (!this.isAcceptingEditors) {
      this.logger.log(
        `Language pair ${this.id} is already not accepting editors`,
      );
      return;
    }

    this.isAcceptingEditors = false;
    this.updatedAt = new Date();

    this.logger.log(
      `Language pair ${this.id} (${this.sourceLanguageCode}-${this.targetLanguageCode}) is no longer accepting editors`,
    );
  }
}
