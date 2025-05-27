import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ERRORS } from '@libs/contracts/common/errors/errors';
import { DomainException } from '@common/exceptions';
import { ListTranslationsQuery } from './list-translations.query';
import { TranslationRepository } from 'src/internal/translation/infrastructure';
import { ListTranslationsQuery as ListTranslationsQueryContract } from '@libs/contracts/translation/queries';
import {
  TranslationFormat,
  TranslationStatus,
} from '@libs/contracts/translation/enums';
import { z } from 'zod';

@QueryHandler(ListTranslationsQuery)
export class ListTranslationsHandler
  implements
    IQueryHandler<ListTranslationsQuery, ListTranslationsQueryContract.Response>
{
  private readonly logger = new Logger(ListTranslationsHandler.name);

  constructor(private readonly repository: TranslationRepository) {}

  async execute({
    params,
  }: ListTranslationsQuery): Promise<ListTranslationsQueryContract.Response> {
    this.logger.debug(
      `Listing translations for customer: ${params.customerId} with limit: ${params.limit}, offset: ${params.offset}`,
    );

    try {
      const translations = await this.repository.findManyWithCriteria(
        { customerId: params.customerId },
        params.limit,
        params.offset,
      );

      return translations.map((translation) => ({
        id: translation.id,
        format: z.nativeEnum(TranslationFormat).parse(translation.format),
        status: z.nativeEnum(TranslationStatus).parse(translation.status),
        createdAt: translation.createdAt,
        originalContent: translation.originalContent,
        translatedContent: translation.translatedContent,
        sourceLanguage: translation.sourceLanguageCode,
        targetLanguage: translation.targetLanguageCode,
        customerId: translation.customerId,
      }));
    } catch (error) {
      if (error instanceof DomainException) {
        throw error;
      }

      this.logger.error(
        `Error listing translations: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new DomainException(ERRORS.TRANSLATION_TASK.FIND_FAILED);
    }
  }
}
