import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { DomainException } from '@common/exceptions';
import {
  EvaluationType,
  EditorLanguagePairQualificationStatus,
} from '@prisma/client';
import { ERRORS } from 'libs/contracts/common/errors/errors';
import {
  InitiateEditorEvaluationCommand,
  IInitiateEditorEvaluationCommandResult,
} from './initiate-editor-evaluation.command';
import { EditorRepository } from 'src/internal/editor/infrastructure/repositories/editor.repository';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { EditorLanguagePairRepository } from 'src/internal/editor/infrastructure/repositories/editor-language-pair.repository';
import { EvaluationSet } from '../../../domain/entities';
import { EvaluationSetRepository } from 'src/internal/evaluation/infrastructure/repositories';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure';

@Injectable()
@CommandHandler(InitiateEditorEvaluationCommand)
export class InitiateEditorEvaluationHandler
  implements
    ICommandHandler<
      InitiateEditorEvaluationCommand,
      IInitiateEditorEvaluationCommandResult
    >
{
  private readonly logger = new Logger(InitiateEditorEvaluationHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly editorRepository: EditorRepository,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly editorLanguagePairRepository: EditorLanguagePairRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(
    command: InitiateEditorEvaluationCommand,
  ): Promise<IInitiateEditorEvaluationCommandResult> {
    try {
      const { editorId, languagePairId } = command.props;

      const type = EvaluationType.INITIAL_QUALIFICATION;

      this.logger.log(
        `Initiating ${type} evaluation for editor ${editorId} in language pair ${languagePairId}`,
      );

      const editor = await this.editorRepository.findById(editorId);
      if (!editor) {
        this.logger.warn(`Editor with id ${editorId} not found`);
        throw new DomainException(ERRORS.EDITOR.NOT_FOUND);
      }

      const languagePair =
        await this.languagePairRepository.findById(languagePairId);
      if (!languagePair) {
        this.logger.warn(`Language pair with id ${languagePairId} not found`);
        throw new DomainException(ERRORS.LANGUAGE_PAIR.NOT_FOUND);
      }

      if (!languagePair.isAcceptingEditors) {
        this.logger.warn(
          `Language pair ${languagePairId} is not accepting new editors at this time`,
        );
        throw new DomainException(ERRORS.LANGUAGE_PAIR.NOT_ACCEPTING_EDITORS);
      }

      const editorLanguagePair =
        await this.editorLanguagePairRepository.findByEditorAndLanguagePair(
          editorId,
          languagePairId,
        );
      if (!editorLanguagePair) {
        this.logger.warn(
          `Editor with id ${editorId} is not associated with language pair ${languagePairId}`,
        );
        throw new DomainException(ERRORS.EDITOR.NOT_FOUND);
      }

      if (
        editorLanguagePair.qualificationStatus !==
        EditorLanguagePairQualificationStatus.INITIAL_EVALUATION_REQUIRED
      ) {
        this.logger.warn(
          `Editor with id ${editorId} is not eligible for initial evaluation in language pair ${languagePairId}. Current status: ${editorLanguagePair.qualificationStatus}`,
        );
        throw new DomainException(
          ERRORS.EVALUATION.EDITOR_NOT_ELIGIBLE_FOR_EVALUATION,
        );
      }

      const evaluationSet = EvaluationSet.create({
        type,
        editorId,
        languagePairId,
        editorLanguagePairId: editorLanguagePair.id,
      });

      const evaluationSetWithEvents =
        this.publisher.mergeObjectContext(evaluationSet);

      await this.evaluationSetRepository.save(evaluationSet);

      evaluationSetWithEvents.commit();

      this.logger.log(
        `Evaluation set ${evaluationSet.id} created and is in ${evaluationSet.status} status`,
      );

      return {
        evaluationSetId: evaluationSet.id,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
