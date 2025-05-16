import { ICommand } from '@nestjs/cqrs';
import { OrderType } from '@prisma/client';

export interface ICreateOrderCommandProps {
  customerId: string;
  languagePairId: string;
  sourceContent: string;
  type: OrderType;
}

export interface ICreateOrderCommandResult {
  id: string;
}

export class CreateOrderCommand implements ICommand {
  constructor(public readonly props: ICreateOrderCommandProps) {}
}
