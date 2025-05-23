export interface IListTranslationsQueryPayload {
  customerId: string;
  limit?: number;
  offset?: number;
  status?: string;
}

export class ListTranslationsQuery {
  constructor(public readonly params: IListTranslationsQueryPayload) {}
}
