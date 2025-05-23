import { ICommand } from '@nestjs/cqrs';

export interface ICreateOrderCommandProps {
  customerId: string;
  languagePairId: string;
  sourceContent: string;
}

export interface ICreateOrderCommandResult {
  id: string;
}

export class CreateOrderCommand implements ICommand {
  constructor(public readonly props: ICreateOrderCommandProps) {}
}
