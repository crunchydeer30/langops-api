export interface CreateCustomerCommandProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class CreateCustomerCommand {
  constructor(public readonly props: CreateCustomerCommandProps) {}
}
