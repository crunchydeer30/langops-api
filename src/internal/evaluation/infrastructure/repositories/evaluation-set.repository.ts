import { Injectable, Logger } from '@nestjs/common';
import { EvaluationSet as PrismaEvaluationSet } from '@prisma/client';
import { EvaluationSet } from '../../domain/entities';
import { IEvaluationSetRepository } from '../../domain/ports';
import { EvaluationSetMapper } from '../mappers';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Injectable()
export class EvaluationSetRepository implements IEvaluationSetRepository {
  private readonly logger = new Logger(EvaluationSetRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: EvaluationSetMapper,
  ) {}

  async findById(id: string): Promise<EvaluationSet | null> {
    this.logger.debug(`Finding evaluation set by id: ${id}`);
    const evaluationSet = await this.prisma.evaluationSet.findUnique({
      where: { id },
    });

    if (!evaluationSet) {
      this.logger.debug(`Evaluation set with id ${id} not found`);
      return null;
    }

    this.logger.debug(`Evaluation set with id ${id} found`);
    return this.mapper.toDomain(evaluationSet);
  }

  async findByEditorIdAndLanguagePairId(
    editorId: string,
    languagePairId: string,
  ): Promise<EvaluationSet[]> {
    this.logger.debug(
      `Finding evaluation sets for editor ${editorId} and language pair ${languagePairId}`,
    );
    const evaluationSets = await this.prisma.evaluationSet.findMany({
      where: {
        editorId,
        languagePairId,
      },
    });

    this.logger.debug(
      `Found ${evaluationSets.length} evaluation sets for editor ${editorId} and language pair ${languagePairId}`,
    );
    return evaluationSets.map((evaluationSet) =>
      this.mapper.toDomain(evaluationSet),
    );
  }

  async findByEditorId(editorId: string): Promise<EvaluationSet[]> {
    this.logger.debug(`Finding evaluation sets for editor ${editorId}`);
    const evaluationSets = await this.prisma.evaluationSet.findMany({
      where: {
        editorId,
      },
    });

    this.logger.debug(
      `Found ${evaluationSets.length} evaluation sets for editor ${editorId}`,
    );
    return evaluationSets.map((evaluationSet) =>
      this.mapper.toDomain(evaluationSet),
    );
  }

  async save(evaluationSet: EvaluationSet): Promise<EvaluationSet> {
    this.logger.debug(`Saving evaluation set with id ${evaluationSet.id}`);

    const exists = await this.prisma.evaluationSet.findUnique({
      where: { id: evaluationSet.id },
    });

    let savedEvaluationSet: PrismaEvaluationSet;

    if (exists) {
      this.logger.debug(`Updating existing evaluation set ${evaluationSet.id}`);
      savedEvaluationSet = await this.prisma.evaluationSet.update({
        where: { id: evaluationSet.id },
        data: this.mapper.toUpdatePersistence(evaluationSet),
      });
    } else {
      this.logger.debug(`Creating new evaluation set ${evaluationSet.id}`);
      savedEvaluationSet = await this.prisma.evaluationSet.create({
        data: this.mapper.toPersistence(evaluationSet),
      });
    }

    this.logger.debug(`Evaluation set ${evaluationSet.id} saved successfully`);
    return this.mapper.toDomain(savedEvaluationSet);
  }
}
