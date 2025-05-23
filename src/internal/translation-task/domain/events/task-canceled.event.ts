export interface ITaskCancelledEvenPayload {
  taskId: string;
  cancellationReason?: string;
}

export class TaskCanceledEvent {
  constructor(public readonly payload: ITaskCancelledEvenPayload) {}
}
