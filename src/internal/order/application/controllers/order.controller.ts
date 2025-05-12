import {
  Body,
  Controller,
  Post,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/internal/auth/guards';
import { RolesGuard } from 'src/internal/auth/guards/roles.guard';
import { Roles } from 'src/internal/auth/decorators/roles.decorator';
import {
  JwtPayload,
  UserRole,
} from 'src/internal/auth/interfaces/jwt-payload.interface';
import { ORDER_HTTP_CONTROLLER, ORDER_HTTP_ROUTES } from 'libs/contracts/order';
import {
  CreateOrderBodyDto,
  CreateOrderResponseDto,
} from '../dtos/create-order.dto';
import {
  CreateOrderCommand,
  ICreateOrderCommandProps,
  ICreateOrderCommandResult,
} from '../commands/create-order';
import { GetJWTPayload } from 'src/internal/auth/decorators';

@ApiTags('orders')
@Controller(ORDER_HTTP_CONTROLLER.ROOT)
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(ORDER_HTTP_ROUTES.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new order for translation' })
  async createOrder(
    @Body() createOrderDto: CreateOrderBodyDto,
    @GetJWTPayload() { id: customerId }: JwtPayload,
  ): Promise<CreateOrderResponseDto> {
    this.logger.log(`Received order creation from customer "${customerId}"`);

    const commandProps: ICreateOrderCommandProps = {
      customerId,
      languagePairId: createOrderDto.languagePairId,
      originalText: createOrderDto.originalText,
      taskSpecificInstructions: createOrderDto.taskSpecificInstructions,
    };

    const result = await this.commandBus.execute<
      CreateOrderCommand,
      ICreateOrderCommandResult
    >(new CreateOrderCommand(commandProps));

    return result;
  }
}
