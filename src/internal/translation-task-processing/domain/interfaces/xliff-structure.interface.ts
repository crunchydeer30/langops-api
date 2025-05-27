export interface XliffDocumentMetadata {
  version: string;
  xmlns?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  originalFile?: string;
  datatype?: string;
  toolId?: string;
  toolName?: string;
  toolVersion?: string;
}

export interface XliffUnit {
  id: string;
  source: string;
  target?: string;
  fileId?: string;
  groupId?: string;
}

export interface XliffFile {
  id: string;
  original?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  datatype?: string;
  toolId?: string;
  toolName?: string;
  toolVersion?: string;
  units: XliffUnit[];
}

export interface XliffRoot {
  version: string;
  xmlns?: string;
  files: XliffFile[];
}
