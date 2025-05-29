export class ProductionTaskCompletedEvent {
  constructor(
    public readonly payload: {
      taskId: string;
      orderId: string;
      editorId: string;
      segmentCount: number;
    },
  ) {}
}
