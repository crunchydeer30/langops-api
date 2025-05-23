import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import {
  TRANSLATION_HTTP_CONTROLLER,
  TRANSLATION_HTTP_ROUTES,
} from 'libs/contracts/translation';
import { CreateTranslationCommand } from '../commands/create-translation/create-translation.command';
import {
  CreateTranslationRequestDto,
  CreateTranslationResponseDto,
  GetTranslationByIdParamsDto,
  GetTranslationByIdResponseDto,
  ListTranslationsQueryParamsDto,
  ListTranslationsResponseDto,
} from '../dto';
import { JwtPayload, UserRole } from 'src/internal/auth/application/interfaces';
import { GetJWTPayload, Roles } from 'src/internal/auth/application/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/internal/auth/application/guards';
import { GetTranslationByIdQuery, ListTranslationsQuery } from '../queries';

@ApiTags('translation')
@Controller(TRANSLATION_HTTP_CONTROLLER.ROOT)
export class TranslationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(TRANSLATION_HTTP_ROUTES.CREATE)
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async createTranslation(
    @Body() dto: CreateTranslationRequestDto,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<CreateTranslationResponseDto> {
    const createTranslationResult = await this.commandBus.execute<
      CreateTranslationCommand,
      CreateTranslationResponseDto
    >(
      new CreateTranslationCommand({
        customerId: jwtPayload.id,
        sourceLanguage: dto.sourceLanguage,
        targetLanguage: dto.targetLanguage,
        text: dto.text,
        format: dto.format,
      }),
    );

    return createTranslationResult;
  }

  @Get(TRANSLATION_HTTP_ROUTES.GET_BY_ID)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async getTaskById(
    @Param() params: GetTranslationByIdParamsDto,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<GetTranslationByIdResponseDto> {
    const result = await this.queryBus.execute<
      GetTranslationByIdQuery,
      GetTranslationByIdResponseDto
    >(
      new GetTranslationByIdQuery({
        id: params.id,
        customerId: jwtPayload.id,
      }),
    );

    return result;
  }

  @Get(TRANSLATION_HTTP_ROUTES.LIST)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async listTranslations(
    @Query() queryParams: ListTranslationsQueryParamsDto,
    @GetJWTPayload() jwtPayload: JwtPayload,
  ): Promise<ListTranslationsResponseDto> {
    const result = await this.queryBus.execute<
      ListTranslationsQuery,
      ListTranslationsResponseDto
    >(
      new ListTranslationsQuery({
        customerId: jwtPayload.id,
        limit: queryParams.limit,
        offset: queryParams.offset,
        status: queryParams.status,
      }),
    );

    return result;
  }
}
