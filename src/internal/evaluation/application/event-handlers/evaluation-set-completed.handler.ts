import { EventsHandler, IEventHandler, EventPublisher } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EvaluationSetCompletedEvent } from '../../domain/events';
import { EditorLanguagePairRepository } from 'src/internal/editor/infrastructure/repositories/editor-language-pair.repository';
import { EvaluationSetRepository } from '../../infrastructure/repositories';
import { EditorLanguagePairQualificationStatus } from '@prisma/client';

@EventsHandler(EvaluationSetCompletedEvent)
export class EvaluationSetCompletedHandler
  implements IEventHandler<EvaluationSetCompletedEvent>
{
  private readonly logger = new Logger(EvaluationSetCompletedHandler.name);

  constructor(
    private readonly evaluationSetRepository: EvaluationSetRepository,
    private readonly editorLanguagePairRepository: EditorLanguagePairRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(event: EvaluationSetCompletedEvent): Promise<void> {
    const {
      evaluationSetId,
      editorId,
      languagePairId,
      averageRating,
      isQualified,
    } = event.payload;

    this.logger.log(
      `Handling evaluation set completed event for set ${evaluationSetId} with average rating ${averageRating}. Qualification: ${isQualified ? 'qualified' : 'not qualified'}`,
    );

    try {
      const editorLanguagePair =
        await this.editorLanguagePairRepository.findByEditorAndLanguagePair(
          editorId,
          languagePairId,
        );

      if (!editorLanguagePair) {
        this.logger.error(
          `Cannot find editor language pair for editor ${editorId} and language pair ${languagePairId}`,
        );
        return;
      }

      const newStatus = isQualified
        ? EditorLanguagePairQualificationStatus.QUALIFIED
        : EditorLanguagePairQualificationStatus.NOT_QUALIFIED;

      if (editorLanguagePair.qualificationStatus !== newStatus) {
        this.logger.log(
          `Updating qualification status for editor ${editorId} in language pair ${languagePairId} from ${editorLanguagePair.qualificationStatus} to ${newStatus}`,
        );

        const editorLanguagePairWithContext =
          this.eventPublisher.mergeObjectContext(editorLanguagePair);

        editorLanguagePairWithContext.updateQualificationStatus(newStatus);

        await this.editorLanguagePairRepository.save(
          editorLanguagePairWithContext,
        );

        editorLanguagePairWithContext.commit();

        this.logger.log(
          `Successfully updated qualification status for editor ${editorId} in language pair ${languagePairId}`,
        );
      } else {
        this.logger.log(
          `Qualification status for editor ${editorId} in language pair ${languagePairId} remains unchanged at ${newStatus}`,
        );
      }
    } catch (error) {
      const typedError = error as Error;
      this.logger.error(
        `Error updating qualification status for evaluation set ${evaluationSetId}: ${typedError.message}`,
        typedError.stack,
      );

      try {
        this.logger.debug('Attempting direct database update as fallback...');
        const prismaClient = this.editorLanguagePairRepository['prisma'];

        const result = await prismaClient.editorLanguagePair.findFirst({
          where: {
            editorId,
            languagePairId,
          },
        });

        if (result) {
          this.logger.debug(
            'Found editor language pair, updating directly in database...',
          );

          await prismaClient.editorLanguagePair.update({
            where: { id: result.id },
            data: {
              qualificationStatus: isQualified
                ? EditorLanguagePairQualificationStatus.QUALIFIED
                : EditorLanguagePairQualificationStatus.NOT_QUALIFIED,
              updatedAt: new Date(),
            },
          });

          this.logger.debug('Direct database update successful');
        } else {
          this.logger.debug(
            'Could not find editor language pair for direct update',
          );
        }
      } catch (fallbackError) {
        const typedFallbackError = fallbackError as Error;
        this.logger.error(
          `Fallback update also failed: ${typedFallbackError.message}`,
          typedFallbackError.stack,
        );
      }
    }
  }
}
