import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { ISampleEvaluationContentRepository } from '../../domain/ports/sample-evaluation-content.repository.interface';
import { SampleEvaluationContent } from '../../domain/entities/sample-evaluation-content.entity';
import { SampleEvaluationContentMapper } from '../mappers/sample-evaluation-content.mapper';

@Injectable()
export class SampleEvaluationContentRepository
  implements ISampleEvaluationContentRepository
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SampleEvaluationContentMapper,
  ) {}

  async findById(id: string): Promise<SampleEvaluationContent | null> {
    const model = await this.prisma.sampleEvaluationContent.findUnique({
      where: { id },
    });
    if (!model) return null;
    return this.mapper.toDomain(model);
  }

  async findByLanguagePairId(
    languagePairId: string,
  ): Promise<SampleEvaluationContent[]> {
    const models = await this.prisma.sampleEvaluationContent.findMany({
      where: { languagePairId },
    });
    return models.map((model) => this.mapper.toDomain(model));
  }

  async save(content: SampleEvaluationContent): Promise<void> {
    await this.prisma.sampleEvaluationContent.upsert({
      where: { id: content.id },
      create: this.mapper.toPersistenceForCreate(content),
      update: this.mapper.toPersistenceForUpdate(content),
    });
  }
}
