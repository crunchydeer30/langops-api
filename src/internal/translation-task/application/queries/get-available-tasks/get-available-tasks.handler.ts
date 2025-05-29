import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  GetAvailableTasksQuery,
  IGetAvailableTasksQueryResponse,
} from './get-available-tasks.query';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';

@QueryHandler(GetAvailableTasksQuery)
export class GetAvailableTasksHandler
  implements IQueryHandler<GetAvailableTasksQuery>
{
  private readonly logger = new Logger(GetAvailableTasksHandler.name);

  constructor(
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {}

  async execute({
    props,
  }: GetAvailableTasksQuery): Promise<IGetAvailableTasksQueryResponse> {
    const { editorId, languagePairId } = props;

    this.logger.log(
      `Getting available tasks for editor ${editorId} in language pair ${languagePairId}`,
    );

    const languagePair =
      await this.languagePairRepository.findById(languagePairId);
    if (!languagePair) {
      this.logger.error(`Language pair ${languagePairId} not found`);
      throw new DomainException(ERRORS.LANGUAGE.NOT_FOUND);
    }

    const isQualified =
      await this.translationTaskRepository.isEditorQualifiedForLanguagePair(
        editorId,
        languagePairId,
      );

    if (!isQualified) {
      this.logger.warn(
        `Editor ${editorId} is not qualified for language pair ${languagePairId}`,
      );
      throw new DomainException(ERRORS.EDITOR.NOT_QUALIFIED_FOR_LANGUAGE_PAIR);
    }

    const count =
      await this.translationTaskRepository.countQueuedForEditing(
        languagePairId,
      );

    return {
      languagePairId,
      sourceLanguage: languagePair.sourceLanguageCode,
      targetLanguage: languagePair.targetLanguageCode,
      availableCount: count,
    };
  }
}
