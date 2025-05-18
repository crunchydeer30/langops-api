export interface BaseTranslateCommandParams {
  taskId: string;
}

export abstract class BaseTranslateCommand {
  constructor(public readonly params: BaseTranslateCommandParams) {}
}
