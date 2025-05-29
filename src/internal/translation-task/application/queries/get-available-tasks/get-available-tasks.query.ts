export type IGetAvailableTasksQueryResponse = {
  languagePairId: string;
  sourceLanguage: string;
  targetLanguage: string;
  availableCount: number;
};

export class GetAvailableTasksQuery {
  constructor(
    public readonly props: {
      editorId: string;
      languagePairId: string;
    },
  ) {}
}
