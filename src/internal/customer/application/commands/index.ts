import { CreateCustomerHandler } from './create-customer/create-customer.handler';

export * from './create-customer/create-customer.command';
export * from './create-customer/create-customer.handler';

export const CustomerCommandHandlers = [CreateCustomerHandler];
