import { AggregateRoot } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

export interface ILanguage {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILanguageCreateArgs {
  id?: string;
  code: string;
  name: string;
}

export class Language extends AggregateRoot implements ILanguage {
  public id: string;
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
    const id = args.id ?? uuidv4();
    const now = new Date();

    const languageProps: ILanguage = {
      id,
      code: args.code,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    };

    return new Language(languageProps);
  }
}
