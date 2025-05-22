export const IAnonymizerClient = 'IAnonymizerClient';

export interface AnonymizationMapping {
  placeholder: string;
  start: number;
  end: number;
  entity_type: string;
  original: string;
}

export interface AnonymizeResult {
  anonymized_text: string;
  mappings: AnonymizationMapping[];
}

export interface AnonymizeBatchItem {
  text: string;
  language: string;
}

export interface IAnonymizerClient {
  anonymize(text: string, language: string): Promise<AnonymizeResult>;
  anonymizeBatch(items: AnonymizeBatchItem[]): Promise<AnonymizeResult[]>;
}
