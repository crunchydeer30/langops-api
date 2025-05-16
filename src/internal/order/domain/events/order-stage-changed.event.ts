import { TranslationStage } from '@prisma/client';

export class OrderStageChangedEvent {
  constructor(
    public readonly payload: {
      orderId: string;
      previousStage?: TranslationStage | null;
      newStage: TranslationStage;
      changedAt: Date;
    },
  ) {}
}
