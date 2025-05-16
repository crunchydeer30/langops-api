import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  LoginCustomerBodyDto,
  LoginCustomerResponseDto,
  RegisterCustomerResponseDto,
} from '../dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AUTH_HTTP_CONTROLLER, AUTH_HTTP_ROUTES } from '@libs/contracts/auth';
import { AuthenticateCustomerCommand } from '../commands/authenticate-customer';
import {
  RegisterCustomerCommand,
  IRegisterCustomerCommandResult,
} from '../commands/register-customer';
import { RegisterCustomerBodyDto } from '../dto';
import { Logger } from '@nestjs/common';

@Controller(AUTH_HTTP_CONTROLLER.CUSTOMER)
export class AuthCustomerController {
  private readonly logger = new Logger(AuthCustomerController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post(AUTH_HTTP_ROUTES.CUSTOMER.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as a customer' })
  @ApiResponse({ type: LoginCustomerResponseDto })
  async login(
    @Body() dto: LoginCustomerBodyDto,
  ): Promise<LoginCustomerResponseDto> {
    this.logger.log(`Processing login request for customer: ${dto.email}`);
    const { email, password } = dto;

    const result = await this.commandBus.execute<
      AuthenticateCustomerCommand,
      { accessToken: string }
    >(new AuthenticateCustomerCommand({ email, password }));

    this.logger.log(
      `Successfully generated access token for customer: ${email}`,
    );
    return { accessToken: result.accessToken };
  }

  @Post(AUTH_HTTP_ROUTES.CUSTOMER.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: RegisterCustomerResponseDto,
    description: 'Customer registered successfully',
  })
  async register(
    @Body() dto: RegisterCustomerBodyDto,
  ): Promise<RegisterCustomerResponseDto> {
    this.logger.log(
      `Processing customer registration with email: ${dto.email}`,
    );

    const result = await this.commandBus.execute<
      RegisterCustomerCommand,
      IRegisterCustomerCommandResult
    >(
      new RegisterCustomerCommand({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
      }),
    );

    this.logger.log(
      `Successfully registered customer with ID: ${result.userId}`,
    );

    return {
      userId: result.userId,
      accessToken: result.accessToken,
    };
  }
}
