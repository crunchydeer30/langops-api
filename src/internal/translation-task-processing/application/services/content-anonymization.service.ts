import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AnonymizerHttpAdapter } from 'src/integration/anonymizer/anonymizer.http.adapter';
import { AnonymizeBatchItem } from '../../domain/ports/anonymizer.client';
import { SegmentDto } from './html-parsing.service';

export interface SensitiveDataMappingDto {
  id: string;
  tokenIdentifier: string;
  sensitiveType: string;
  originalValue: string;
}

export interface AnonymizedSegmentDto extends SegmentDto {
  anonymizedContent: string;
}

export interface AnonymizationResult {
  segments: AnonymizedSegmentDto[];
  sensitiveDataMappings: SensitiveDataMappingDto[];
}

@Injectable()
export class ContentAnonymizationService {
  private readonly logger = new Logger(ContentAnonymizationService.name);

  constructor(private readonly anonymizerClient: AnonymizerHttpAdapter) {}

  async anonymize(
    segments: SegmentDto[],
    sourceLanguageCode: string,
  ): Promise<AnonymizationResult> {
    this.logger.debug(`Anonymizing ${segments.length} segments`);

    const sensitiveDataMappings: SensitiveDataMappingDto[] = [];
    const anonymizedSegments: AnonymizedSegmentDto[] = segments.map(
      (segment) => ({
        ...segment,
        anonymizedContent: '',
      }),
    );

    const batchItems: AnonymizeBatchItem[] = segments.map((segment) => ({
      text: segment.sourceContent,
      language: sourceLanguageCode,
    }));

    try {
      const anonymizationResults =
        await this.anonymizerClient.anonymizeBatch(batchItems);

      for (let i = 0; i < anonymizationResults.length; i++) {
        const result = anonymizationResults[i];

        anonymizedSegments[i].anonymizedContent = result.anonymized_text;

        if (result.mappings && result.mappings.length > 0) {
          for (const mapping of result.mappings) {
            sensitiveDataMappings.push({
              id: uuidv4(),
              tokenIdentifier: mapping.placeholder,
              sensitiveType: mapping.entity_type,
              originalValue: mapping.original,
            });
          }
        }
      }

      this.logger.debug(
        `Anonymization completed: ${sensitiveDataMappings.length} sensitive entities identified`,
      );

      return {
        segments: anonymizedSegments,
        sensitiveDataMappings,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Anonymization service error: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
