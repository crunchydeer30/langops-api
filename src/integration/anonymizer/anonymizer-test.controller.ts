import { Controller, Get, Inject } from '@nestjs/common';
import { IAnonymizerClient } from 'src/internal/translation-task-processing/domain/ports/anonymizer.client';

@Controller('anon')
export class AnonTestController {
  constructor(
    @Inject(IAnonymizerClient) private readonly client: IAnonymizerClient,
  ) {}

  @Get('test')
  async test() {
    const sample = 'Hello Alice, call me at 12345.';
    const language = 'en';
    const result = await this.client.anonymize(sample, language);
    return { sample, result };
  }

  @Get('batch')
  async testBatch() {
    const items = [
      {
        text: 'John, hello world, my name is Jane Doe. My number is: 034453334. And my name is John Doe',
        language: 'en',
      },
      {
        text: 'Hey, Jane',
        language: 'en',
      },
    ];

    return this.client.anonymizeBatch(items);
  }
}
