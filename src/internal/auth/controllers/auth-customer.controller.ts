import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import {
  LoginCustomerBodyDto,
  LoginCustomerResponseDto,
  RegisterCustomerResponseDto,
} from '../dto';
import { ApiResponse } from '@nestjs/swagger';
import { AUTH_HTTP_CONTROLLER, AUTH_HTTP_ROUTES } from 'libs/contracts/auth';
import { CreateCustomerCommand } from 'src/internal/customer/application/commands';
import { AuthenticateCustomerCommand } from '../application';
import { RegisterCustomerBodyDto } from '../dto';
import { Customer } from 'src/internal/customer/domain/entities/customer.entity';

@Controller(AUTH_HTTP_CONTROLLER.CUSTOMER)
export class AuthCustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @Post(AUTH_HTTP_ROUTES.CUSTOMER.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: LoginCustomerResponseDto })
  async login(
    @Body() dto: LoginCustomerBodyDto,
  ): Promise<LoginCustomerResponseDto> {
    const { email, password } = dto;

    return this.commandBus.execute(
      new AuthenticateCustomerCommand({ email, password }),
    );
  }

  @Post(AUTH_HTTP_ROUTES.CUSTOMER.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterCustomerBodyDto,
  ): Promise<RegisterCustomerResponseDto> {
    const customer = await this.commandBus.execute<
      CreateCustomerCommand,
      Customer
    >(
      new CreateCustomerCommand({
        ...dto,
        password: dto.password,
      }),
    );

    const accessToken = this.authService.generateJwt({
      id: customer.id,
      email: customer.email.value,
    });

    return { accessToken };
  }
}
