import { Order } from '../entities/order.entity';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByClientId(clientId: string): Promise<Order[]>;
}

export const IOrderRepository = Symbol('IOrderRepository');
