import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  GetAvailableTasksQuery,
  IGetAvailableTasksQueryResponse,
} from './get-available-tasks.query';
import { LanguagePairRepository } from 'src/internal/language/infrastructure/repositories/language-pair.repository';
import { EditorLanguagePairRepository } from 'src/internal/editor/infrastructure/repositories/editor-language-pair.repository';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';

@QueryHandler(GetAvailableTasksQuery)
export class GetAvailableTasksHandler
  implements
    IQueryHandler<GetAvailableTasksQuery, IGetAvailableTasksQueryResponse>
{
  private readonly logger = new Logger(GetAvailableTasksHandler.name);

  constructor(
    private readonly editorLanguagePairRepository: EditorLanguagePairRepository,
    private readonly languagePairRepository: LanguagePairRepository,
    private readonly translationTaskRepository: TranslationTaskRepository,
  ) {}

  async execute({ props }: GetAvailableTasksQuery): Promise<
    Array<{
      languagePairId: string;
      sourceLanguage: string;
      targetLanguage: string;
      availableCount: number;
    }>
  > {
    const { editorId } = props;
    this.logger.debug(`Getting available tasks for editor: ${editorId}`);

    const editorLanguagePairs =
      await this.editorLanguagePairRepository.findByEditor(editorId);

    const result = await Promise.all(
      editorLanguagePairs.map(async (pair) => {
        const languagePair = await this.languagePairRepository.findById(
          pair.languagePairId,
        );
        if (!languagePair) {
          return null;
        }

        const count =
          await this.translationTaskRepository.countQueuedForEditing(
            pair.languagePairId,
          );

        return {
          languagePairId: pair.languagePairId,
          sourceLanguage: languagePair.sourceLanguageCode,
          targetLanguage: languagePair.targetLanguageCode,
          availableCount: count,
        };
      }),
    );

    const filteredResult = result.filter((item) => item !== null);

    this.logger.debug(
      `Found ${filteredResult.length} language pairs with available tasks for editor: ${editorId}`,
    );

    return filteredResult;
  }
}
