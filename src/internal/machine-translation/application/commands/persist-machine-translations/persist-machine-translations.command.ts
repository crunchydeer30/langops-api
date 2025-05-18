export interface PersistMachineTranslationsCommandParams {
  taskId: string;
  results: { segmentId: string; translatedText: string }[];
}

export class PersistMachineTranslationsCommand {
  constructor(
    public readonly params: PersistMachineTranslationsCommandParams,
  ) {}
}
