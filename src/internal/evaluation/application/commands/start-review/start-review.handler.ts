import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StartReviewCommand } from './start-review.command';
import { EditorRole, EvaluationSetStatus } from '@prisma/client';
import { DomainException } from '@common/exceptions';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import { EvaluationSetRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { EditorLanguagePairRepository } from 'src/internal/editor/infrastructure/repositories/editor-language-pair.repository';

@CommandHandler(StartReviewCommand)
export class StartReviewHandler implements ICommandHandler<StartReviewCommand> {
  private readonly logger = new Logger(StartReviewHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly editorLanguagePairRepository: EditorLanguagePairRepository,
  ) {}

  async execute(
    command: StartReviewCommand,
  ): Promise<{ success: boolean; evaluationSetId: string }> {
    const { evaluationSetId, reviewerId } = command.props;

    this.logger.log(
      `Senior editor ${reviewerId} starting review for evaluation set ${evaluationSetId}`,
    );

    const evaluationSet =
      await this.evaluationSetRepository.findById(evaluationSetId);
    if (!evaluationSet) {
      throw new DomainException(ERRORS.EVALUATION.NOT_FOUND);
    }

    if (evaluationSet.status !== EvaluationSetStatus.READY_FOR_REVIEW) {
      throw new DomainException(ERRORS.EVALUATION.EVALUATION_ALREADY_STARTED);
    }

    if (evaluationSet.evaluatorId) {
      throw new DomainException(ERRORS.EVALUATION.ALREADY_ASSIGNED);
    }

    const qualifiedPairs =
      await this.editorLanguagePairRepository.findQualifiedByEditorAndRole(
        reviewerId,
        EditorRole.SENIOR,
      );

    const isQualified = qualifiedPairs.some(
      (pair) => pair.languagePairId === evaluationSet.languagePairId,
    );

    if (!isQualified) {
      throw new DomainException(
        ERRORS.EVALUATION.NOT_QUALIFIED_FOR_LANGUAGE_PAIR,
      );
    }

    evaluationSet.assignReviewer(reviewerId);

    await this.evaluationSetRepository.save(evaluationSet);

    this.logger.log(
      `Successfully started review for evaluation set ${evaluationSetId} by senior editor ${reviewerId}`,
    );

    return {
      success: true,
      evaluationSetId,
    };
  }
}
