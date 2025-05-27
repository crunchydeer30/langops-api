import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ERRORS } from '@libs/contracts/common/errors/errors';
import { DomainException } from '@common/exceptions';
import { GetTranslationByIdResponseDto } from '../../dto';
import { z } from 'zod';
import {
  TranslationFormat,
  TranslationStatus,
} from '@libs/contracts/translation/enums';
import { GetTranslationByIdQuery } from './get-translation-by-id.query';
import { TranslationRepository } from 'src/internal/translation/infrastructure';

@QueryHandler(GetTranslationByIdQuery)
export class GetTranslationByIdHandler
  implements
    IQueryHandler<GetTranslationByIdQuery, GetTranslationByIdResponseDto>
{
  private readonly logger = new Logger(GetTranslationByIdHandler.name);

  constructor(private readonly repository: TranslationRepository) {}

  async execute({
    params,
  }: GetTranslationByIdQuery): Promise<GetTranslationByIdResponseDto> {
    this.logger.debug(
      `Getting translation by id: ${params.id} for customer: ${params.customerId}`,
    );

    try {
      const translation = await this.repository.findOneWithCriteria({
        id: params.id,
        customerId: params.customerId,
      });

      if (!translation) {
        throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
      }

      return {
        id: translation.id,
        format: z.nativeEnum(TranslationFormat).parse(translation.format),
        status: z.nativeEnum(TranslationStatus).parse(translation.status),
        createdAt: translation.createdAt,
        originalContent: translation.originalContent,
        translatedContent: translation.translatedContent,
        sourceLanguage: translation.sourceLanguageCode,
        targetLanguage: translation.targetLanguageCode,
        customerId: translation.customerId,
      };
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }

      this.logger.error(
        `Error getting translation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.FIND_FAILED);
    }
  }
}
