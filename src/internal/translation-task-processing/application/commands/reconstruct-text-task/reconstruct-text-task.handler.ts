import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { ReconstructTextTaskCommand } from './reconstruct-text-task.command';
import { BaseReconstructTaskHandler } from '../base-reconstruct-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TextParsingService } from '../../services/text-parsing.service';
import { TranslationTask } from 'src/internal/translation-task/domain';
import { SegmentDto } from '../../services/html-parsing.service';
import { SensitiveDataMappingRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/sensitive-data-mapping.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';

@Injectable()
@CommandHandler(ReconstructTextTaskCommand)
export class ReconstructTextTaskHandler extends BaseReconstructTaskHandler {
  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly segmentRepository: TranslationTaskSegmentRepository,
    protected readonly sensitiveDataMappingRepository: SensitiveDataMappingRepository,
    protected readonly commandBus: CommandBus,
    private readonly textParsingService: TextParsingService,
  ) {
    super(
      translationTaskRepository,
      segmentRepository,
      sensitiveDataMappingRepository,
      commandBus,
    );
  }

  protected async reconstruct(
    task: TranslationTask,
    segments: SegmentDto[],
  ): Promise<string> {
    this.logger.debug(
      `Reconstructing text task ${task.id} with ${segments.length} segments`,
    );

    const reconstructedText =
      this.textParsingService.reconstructPlainTextContent(segments);

    const mappingsPerSegment = await Promise.all(
      segments.map((s) =>
        this.sensitiveDataMappingRepository.findBySegmentId(s.id),
      ),
    );
    const mappings = mappingsPerSegment.flat();

    if (!mappings.length) {
      this.logger.debug(`No sensitive data mappings found for task ${task.id}`);
      return reconstructedText;
    }

    this.logger.debug(
      `Replacing ${mappings.length} sensitive data tokens in task ${task.id}`,
    );

    let finalContent = reconstructedText;
    for (const mapping of mappings) {
      const escapedToken = mapping.tokenIdentifier.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      finalContent = finalContent.replace(
        new RegExp(escapedToken, 'g'),
        mapping.originalValue,
      );
    }

    return finalContent;
  }
}
