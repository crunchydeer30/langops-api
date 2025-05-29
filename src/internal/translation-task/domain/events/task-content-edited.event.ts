export class TaskContentEditedEvent {
  constructor(
    public readonly payload: {
      taskId: string;
      editorId?: string;
      segmentCount: number;
    },
  ) {}
}
