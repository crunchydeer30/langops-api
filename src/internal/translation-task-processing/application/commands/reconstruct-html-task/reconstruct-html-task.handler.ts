import { Injectable } from '@nestjs/common';
import { CommandBus, CommandHandler } from '@nestjs/cqrs';
import { ReconstructHtmlTaskCommand } from './reconstruct-html-task.command';
import { BaseReconstructTaskHandler } from '../base-reconstruct-task';
import { TranslationTaskRepository } from 'src/internal/translation-task/infrastructure/repositories/translation-task.repository';
import { TranslationTaskSegmentRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/translation-task-segment.repository';
import { SensitiveDataMappingRepository } from 'src/internal/translation-task-processing/infrastructure/repositories/sensitive-data-mapping.repository';
import { HTMLParsingService } from '../../services/html-parsing.service';
import type { TranslationTask } from 'src/internal/translation-task/domain';
import type { SegmentDto } from '../../services/html-parsing.service';
import type { OriginalStructure } from 'src/internal/translation-task-processing/domain/interfaces/original-structure.interface';

@Injectable()
@CommandHandler(ReconstructHtmlTaskCommand)
export class ReconstructHtmlTaskHandler extends BaseReconstructTaskHandler {
  constructor(
    protected readonly translationTaskRepository: TranslationTaskRepository,
    protected readonly segmentRepository: TranslationTaskSegmentRepository,
    protected readonly sensitiveDataMappingRepository: SensitiveDataMappingRepository,
    protected readonly commandBus: CommandBus,
    private readonly htmlParsingService: HTMLParsingService,
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
    const originalStructure: OriginalStructure =
      typeof task.originalStructure === 'string'
        ? JSON.parse(task.originalStructure)
        : (task.originalStructure as OriginalStructure);

    const processedSegments: SegmentDto[] = await Promise.all(
      segments.map(async (s) => {
        const mappings =
          await this.sensitiveDataMappingRepository.findBySegmentId(s.id);
        let content = s.targetContent ?? s.sourceContent;
        if (mappings.length > 0) {
          content = content.replace(
            new RegExp(
              mappings
                .map((m) =>
                  m.tokenIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                )
                .join('|'),
              'g',
            ),
            (match) =>
              mappings.find((m) => m.tokenIdentifier === match)!.originalValue,
          );
        }
        return { ...s, sourceContent: content };
      }),
    );

    const finalHtml = this.htmlParsingService.reconstructHTMLContent(
      originalStructure,
      processedSegments,
    );

    return finalHtml;
  }
}
