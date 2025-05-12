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
    return this.mapper.toDomain(model);
  }

  async findByClientId(clientId: string): Promise<Order[]> {
    const models = await this.prisma.order.findMany({
      where: { clientId },
    });
    return models.map((model) => this.mapper.toDomain(model)!).filter(Boolean);
  }

  async save(order: Order): Promise<void> {
    const data = this.mapper.toPersistence(order);
    await this.prisma.order.upsert({
      where: { id: order.id },
      update: data,
      create: data,
    });
  }
}
