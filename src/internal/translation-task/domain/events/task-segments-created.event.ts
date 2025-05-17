export class TaskSegmentsCreatedEvent {
  constructor(
    public readonly taskId: string,
    public readonly segmentCount: number,
  ) {}
}
