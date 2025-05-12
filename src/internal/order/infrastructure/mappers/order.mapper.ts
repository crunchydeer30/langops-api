import { Injectable } from '@nestjs/common';
import { Order as OrderModel } from '@prisma/client';
import { Order, IOrder } from '../../domain/entities/order.entity';

@Injectable()
export class OrderMapper {
  toDomain(model: OrderModel | null): Order | null {
    if (!model) return null;
    const props: IOrder = {
      id: model.id,
      clientId: model.clientId,
      languagePairId: model.languagePairId,
      editorId: model.editorId,
      seniorEditorId: model.seniorEditorId,
      originalText: model.originalText,
      aiTranslatedText: model.aiTranslatedText,
      humanEditedText: model.humanEditedText,
      finalApprovedText: model.finalApprovedText,
      status: model.status,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
    return new Order(props);
  }

  toPersistence(
    entity: Order,
  ): Omit<OrderModel, 'createdAt' | 'updatedAt'> &
    Partial<Pick<OrderModel, 'createdAt' | 'updatedAt'>> {
    return {
      id: entity.id,
      clientId: entity.clientId,
      languagePairId: entity.languagePairId,
      editorId: entity.editorId,
      seniorEditorId: entity.seniorEditorId,
      originalText: entity.originalText,
      aiTranslatedText: entity.aiTranslatedText,
      humanEditedText: entity.humanEditedText,
      finalApprovedText: entity.finalApprovedText,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
