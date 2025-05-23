import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ERRORS } from '@libs/contracts/common/errors/errors';
import { DomainException } from '@common/exceptions';
import { ListTranslationsQuery } from './list-translations.query';
import { TranslationReadRepository } from 'src/internal/translation/infrastructure';
import { ListTranslationsQuery as ListTranslationsQueryContract } from '@libs/contracts/translation/queries';
import {
  TranslationFormat,
  TranslationStage,
  TranslationStatus,
} from '@libs/contracts/translation/enums';
import { z } from 'zod';

@QueryHandler(ListTranslationsQuery)
export class ListTranslationsHandler
  implements
    IQueryHandler<ListTranslationsQuery, ListTranslationsQueryContract.Response>
{
  private readonly logger = new Logger(ListTranslationsHandler.name);

  constructor(private readonly repository: TranslationReadRepository) {}

  async execute({
    params,
  }: ListTranslationsQuery): Promise<ListTranslationsQueryContract.Response> {
    this.logger.debug(
      `Listing translations for customer: ${params.customerId} with limit: ${params.limit}, offset: ${params.offset}`,
    );

    try {
      const translations = await this.repository.findByCustomerId(
        params.customerId,
        params.limit,
        params.offset,
      );

      return translations.map((task) => ({
        id: task.id,
        orderId: task.orderId,
        format: z.nativeEnum(TranslationFormat).parse(task.formatType),
        status: z.nativeEnum(TranslationStatus).parse(task.status),
        currentStage: z.nativeEnum(TranslationStage).parse(task.currentStage),
        wordCount: task.wordCount,
        createdAt: task.createdAt,
        originalContent: task.originalContent,
        translatedContent: task.translatedContent,
        sourceLanguage: task.sourceLanguage,
        targetLanguage: task.targetLanguage,
        customerId: task.customerId,
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
