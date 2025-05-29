import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  GetPendingReviewSetsQuery,
  IGetPendingReviewSetsQueryResponse,
} from './get-pending-review-sets.query';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EditorRole } from '@prisma/client';
import { EvaluationSetRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { EditorLanguagePairRepository } from 'src/internal/editor/infrastructure/repositories/editor-language-pair.repository';

@QueryHandler(GetPendingReviewSetsQuery)
export class GetPendingReviewSetsHandler
  implements IQueryHandler<GetPendingReviewSetsQuery>
{
  private readonly logger = new Logger(GetPendingReviewSetsHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly editorLanguagePairRepository: EditorLanguagePairRepository,
  ) {}

  async execute(
    query: GetPendingReviewSetsQuery,
  ): Promise<IGetPendingReviewSetsQueryResponse[]> {
    try {
      this.logger.log(
        `Senior editor ${query.props.editorId} fetching pending review sets${
          query.props.languagePairId
            ? ` for language pair ${query.props.languagePairId}`
            : ''
        }`,
      );

      const qualifiedPairs =
        await this.editorLanguagePairRepository.findQualifiedByEditorAndRole(
          query.props.editorId,
          EditorRole.SENIOR,
        );

      if (qualifiedPairs.length === 0) {
        this.logger.warn(
          `Senior editor ${query.props.editorId} has no qualified language pairs`,
        );
        return [];
      }

      const qualifiedLanguagePairIds = qualifiedPairs.map(
        (pair) => pair.languagePairId,
      );
      if (
        query.props.languagePairId &&
        !qualifiedLanguagePairIds.includes(query.props.languagePairId)
      ) {
        throw new DomainException(
          ERRORS.EVALUATION.NOT_QUALIFIED_FOR_LANGUAGE_PAIR,
        );
      }

      const evaluationSets =
        await this.evaluationSetRepository.findPendingReviewSets(
          qualifiedLanguagePairIds,
          query.props.languagePairId,
        );

      return evaluationSets.map((set) => ({
        id: set.id,
        languagePairId: set.languagePairId,
        createdAt: set.createdAt,
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching pending review sets: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}
