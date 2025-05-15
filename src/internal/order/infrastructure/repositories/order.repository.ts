import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { IOrderRepository } from '../../domain/ports/order.repository';
import { Order } from '../../domain/entities/order.entity';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: OrderMapper,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const model = await this.prisma.order.findUnique({ where: { id } });
    if (!model) {
      return null;
    }
    return this.mapper.toDomain(model);
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const models = await this.prisma.order.findMany({
      where: { customerId },
    });
    return models.map((model) => this.mapper.toDomain(model)).filter(Boolean);
  }

  async save(order: Order): Promise<void> {
    const {
      id,
      customerId,
      languagePairId,
      editorId,
      seniorEditorId,
      originalText,
      maskedText,
      taskSpecificInstructions,
      status,
      createdAt,
      updatedAt,
    } = this.mapper.toPersistence(order);

    const updateData = {
      id,
      customerId,
      languagePairId,
      editorId,
      seniorEditorId,
      originalText,
      maskedText,
      taskSpecificInstructions,
      status,
      createdAt,
      updatedAt,
    };

    await this.prisma.order.upsert({
      where: { id: order.id },
      update: updateData,
      create: {
        id,
        originalText,
        maskedText,
        taskSpecificInstructions,
        status,
        ...(createdAt && { createdAt }),
        ...(updatedAt && { updatedAt }),
        customer: { connect: { id: customerId } },
        languagePair: { connect: { id: languagePairId } },
        ...(editorId && { editor: { connect: { id: editorId } } }),
        ...(seniorEditorId && {
          seniorEditor: { connect: { id: seniorEditorId } },
        }),
      },
    });
  }
}
