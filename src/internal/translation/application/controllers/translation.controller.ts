import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import {
  TRANSLATION_HTTP_CONTROLLER,
  TRANSLATION_HTTP_ROUTES,
} from 'libs/contracts/translation';
import { CreateTranslationCommand } from '../commands/create-translation/create-translation.command';
import {
  CreateTranslationRequestDto,
  CreateTranslationResponseDto,
} from '../dto';
import { JwtPayload, UserRole } from 'src/internal/auth/application/interfaces';
import { GetJWTPayload, Roles } from 'src/internal/auth/application/decorators';
import { JwtAuthGuard, RolesGuard } from 'src/internal/auth/application/guards';

@ApiTags('translation')
@Controller(TRANSLATION_HTTP_CONTROLLER.ROOT)
export class TranslationController {
  constructor(private readonly commandBus: CommandBus) {}

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
        sourceLanguage: dto.source_language,
        targetLanguage: dto.target_language,
        text: dto.text,
        textFormat: dto.text_format,
        callbackUrl: dto.callback_url,
      }),
    );

    return createTranslationResult;
  }
}
