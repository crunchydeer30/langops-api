import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { timeout, retry } from 'rxjs/operators';
import {
  IAnonymizerClient,
  AnonymizeResult,
  AnonymizeBatchItem,
} from 'src/internal/translation-task-processing/domain/ports/anonymizer.client';

@Injectable()
export class AnonymizerHttpAdapter implements IAnonymizerClient {
  private readonly logger = new Logger(AnonymizerHttpAdapter.name);

  constructor(private readonly httpService: HttpService) {}

  async anonymize(
    text: string,
    language: string,
    sessionId?: string,
  ): Promise<AnonymizeResult> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post<AnonymizeResult>('/anonymize', { text, language, sessionId })
          .pipe(timeout(1000), retry({ count: 2, delay: 500 })),
      );
      const { anonymized_text, mappings: rawMappings } = response.data;

      return {
        anonymized_text,
        mappings: rawMappings,
      };
    } catch (error) {
      this.logger.error(`Anonymizer request failed: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async anonymizeBatch(
    items: AnonymizeBatchItem[],
  ): Promise<AnonymizeResult[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post<AnonymizeResult[]>('/anonymize/batch', items)
          .pipe(timeout(5000), retry({ count: 2, delay: 500 })),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Anonymizer batch request failed: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}
