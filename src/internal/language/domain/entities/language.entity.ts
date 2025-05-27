import { AggregateRoot } from '@nestjs/cqrs';

export interface ILanguage {
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILanguageCreateArgs {
  code: string;
  name: string;
}

export class Language extends AggregateRoot implements ILanguage {
  public code: string;
  public name: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(properties: ILanguage) {
    super();
    Object.assign(this, properties);
  }

  public static reconstitute(properties: ILanguage): Language {
    return new Language(properties);
  }

  public static create(args: ILanguageCreateArgs): Language {
    const now = new Date();

    const languageProps: ILanguage = {
      code: args.code,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    };

    return new Language(languageProps);
  }
}
