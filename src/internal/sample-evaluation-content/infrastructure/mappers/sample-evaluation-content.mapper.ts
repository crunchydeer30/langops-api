import { Injectable } from '@nestjs/common';
import {
  Prisma,
  SampleEvaluationContent as SampleEvaluationContentModel,
} from '@prisma/client';
import {
  SampleEvaluationContent,
  ISampleEvaluationContent,
} from '../../domain/entities/sample-evaluation-content.entity';

@Injectable()
export class SampleEvaluationContentMapper {
  toDomain(model: SampleEvaluationContentModel): SampleEvaluationContent {
    const props: ISampleEvaluationContent = {
      id: model.id,
      content: model.content,
      formatType: model.formatType,
      languagePairId: model.languagePairId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };

    return SampleEvaluationContent.reconstitute(props);
  }

  toPersistenceForUpdate(
    content: SampleEvaluationContent,
  ): Prisma.SampleEvaluationContentUpdateInput {
    const { content: contentText, formatType, languagePairId } = content;

    return {
      content: contentText,
      formatType,
      languagePair: { connect: { id: languagePairId } },
    };
  }

  toPersistenceForCreate(
    content: SampleEvaluationContent,
  ): Prisma.SampleEvaluationContentCreateInput {
    const { id, content: contentText, formatType, languagePairId } = content;

    return {
      id,
      content: contentText,
      formatType,
      languagePair: { connect: { id: languagePairId } },
    };
  }
}
