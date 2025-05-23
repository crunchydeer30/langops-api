export interface IGetTranslationByIdQueryPayload {
  id: string;
  customerId: string;
}

export class GetTranslationByIdQuery {
  constructor(public readonly params: IGetTranslationByIdQueryPayload) {}
}
