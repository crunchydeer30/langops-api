export interface HtmlFormatMetadata {
  container: string;
  row: number;
  col: number;
}

export interface XliffFormatMetadata {
  unitId: string;
}

export interface CsvFormatMetadata {
  row: number;
  col: number;
}

export interface SrtFormatMetadata {
  sequence: number;
  startTime: string;
  endTime: string;
}

export interface PlainTextFormatMetadata {
  paragraph: number;
}

export type FormatMetadata =
  | HtmlFormatMetadata
  | XliffFormatMetadata
  | CsvFormatMetadata
  | SrtFormatMetadata
  | PlainTextFormatMetadata;
