export interface TextNodeStruct {
  type: 'text';
  data: string;
}

export interface SegmentNodeStruct {
  type: 'segment';
  id: number;
}

export type NodeStructure =
  | ElementNodeStruct
  | TextNodeStruct
  | SegmentNodeStruct;

export interface ElementNodeStruct {
  type: 'element';
  tag: string;
  attributes: Record<string, string>;
  children: NodeStructure[];
}

export interface OriginalStructure {
  children: NodeStructure[];
}
