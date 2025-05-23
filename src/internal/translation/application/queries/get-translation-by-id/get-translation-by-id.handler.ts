import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ERRORS } from '@libs/contracts/common/errors/errors';
import { DomainException } from '@common/exceptions';
import { GetTranslationByIdResponseDto } from '../../dto';
import { z } from 'zod';
import {
  TranslationFormat,
  TranslationStage,
  TranslationStatus,
} from '@libs/contracts/translation/enums';
import { GetTranslationByIdQuery } from './get-translation-by-id.query';
import { TranslationTaskReadRepository } from 'src/internal/translation-task/infrastructure';

@QueryHandler(GetTranslationByIdQuery)
export class GetTranslationByIdHandler
  implements
    IQueryHandler<GetTranslationByIdQuery, GetTranslationByIdResponseDto>
{
  private readonly logger = new Logger(GetTranslationByIdHandler.name);

  constructor(
    private readonly taskReadRepository: TranslationTaskReadRepository,
  ) {}

  async execute({
    params,
  }: GetTranslationByIdQuery): Promise<GetTranslationByIdResponseDto> {
    this.logger.debug(
      `Getting translation by id: ${params.id} for customer: ${params.customerId}`,
    );

    try {
      const task = await this.taskReadRepository.findByIdAndCustomerId(
        params.id,
        params.customerId,
      );

      if (!task) {
        throw new DomainException(ERRORS.TRANSLATION_TASK.NOT_FOUND);
      }

      return {
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
