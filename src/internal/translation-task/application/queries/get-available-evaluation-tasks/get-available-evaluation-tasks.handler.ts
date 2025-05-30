import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  GetAvailableEvaluationTasksQuery,
  IGetAvailableEvaluationTasksQueryResponse,
} from './get-available-evaluation-tasks.query';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';

@QueryHandler(GetAvailableEvaluationTasksQuery)
export class GetAvailableEvaluationTasksHandler
  implements IQueryHandler<GetAvailableEvaluationTasksQuery>
{
  private readonly logger = new Logger(GetAvailableEvaluationTasksHandler.name);

  constructor(
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {}

  async execute({
    props,
  }: GetAvailableEvaluationTasksQuery): Promise<IGetAvailableEvaluationTasksQueryResponse> {
    const { editorId, languagePairId } = props;

    this.logger.log(
      `Getting available evaluation tasks for editor ${editorId} in language pair ${languagePairId}`,
    );

    const languagePair =
      await this.languagePairRepository.findById(languagePairId);

    if (!languagePair) {
      this.logger.error(`Language pair ${languagePairId} not found`);
      throw new DomainException(ERRORS.LANGUAGE.NOT_FOUND);
    }

    const isEligible =
      await this.translationTaskRepository.isEditorEligibleForEvaluation(
        editorId,
        languagePairId,
      );

    if (!isEligible) {
      this.logger.warn(
        `Editor ${editorId} is not eligible for evaluation in language pair ${languagePairId}`,
      );
      throw new DomainException(ERRORS.EDITOR.NOT_ELIGIBLE_FOR_EVALUATION);
    }

    const count =
      await this.translationTaskRepository.countQueuedForEvaluation(
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
