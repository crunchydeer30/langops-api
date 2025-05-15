export enum ISensitiveDataType {
  URL = 'URL',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  PASSWORD = 'PASSWORD',
  CODE = 'CODE',
}

export interface ISensitiveDataTokenInfo {
  type: ISensitiveDataType;
  original: string;
}

export type ISensitiveDataTokenMap = Record<string, ISensitiveDataTokenInfo>;
