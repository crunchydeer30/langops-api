import { Prisma, TranslationTaskType } from '@prisma/client';
import * as en_ru from './en-ru/data.json';

export async function seedSampleEvaluationContent(
  prisma: Prisma.TransactionClient,
) {
  console.log('⏳ UPSERTING SAMPLE EVALUATION CONTENT...');

  const sampleContent = [...en_ru];

  for (const task of sampleContent) {
    try {
      // console.log(`\tUpserting sampleEvaluationContent "${sampleEvaluationContent.id}" - "${sampleEvaluationContent.name}..."`);

      await prisma.sampleEvaluationContent.upsert({
        where: {
          id: task.id,
        },
        update: {
          content: task.content,
          formatType: task.formatType as TranslationTaskType,
          languagePairId: task.language_pair_id,
        },
        create: {
          id: task.id,
          content: task.content,
          formatType: task.formatType as TranslationTaskType,
          languagePairId: task.language_pair_id,
        },
      });

      // console.log(`\tSuccessfully upserted sampleEvaluationContent "${sampleEvaluationContent.id}" - "${sampleEvaluationContent.name}"`);
    } catch (e) {
      console.error(
        `\t❌ Failed to upsert a sampleEvaluationContent "${task.id}"`,
        e,
      );
      throw e;
    }
  }
  console.log('✅ SAMPLE EVALUATION CONTENT UPSERTED');
}
