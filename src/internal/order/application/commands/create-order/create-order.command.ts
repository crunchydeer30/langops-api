import { ICommand } from '@nestjs/cqrs';

export interface ICreateOrderCommandProps {
  customerId: string;
  languagePairId: string;
  originalText: string;
  taskSpecificInstructions?: string | null;
}

export interface ICreateOrderCommandResult {
  id: string;
}

export class CreateOrderCommand implements ICommand {
  constructor(public readonly props: ICreateOrderCommandProps) {}
}
