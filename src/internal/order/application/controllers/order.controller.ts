import { ORDER_HTTP_CONTROLLER } from '@libs/contracts/order';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('orders')
@Controller(ORDER_HTTP_CONTROLLER.ROOT)
export class OrderController {}
