import { Prisma } from '@prisma/client';
import * as data from './data.json';

export async function seedLanguagePairs(prisma: Prisma.TransactionClient) {
  console.log('⏳ UPSERTING LANGUAGE PAIRS...');
  for (const languagePair of data) {
    try {
      // console.log(`\tUpserting languagePair "${languagePair.id}" - "${languagePair.name}..."`);

      await prisma.languagePair.upsert({
        where: {
          id: languagePair.id,
        },
        update: {
          sourceLanguageCode: languagePair.source_language_code,
          targetLanguageCode: languagePair.target_language_code,
          isAcceptingEditors: languagePair.is_accepting_new_editors,
        },
        create: {
          id: languagePair.id,
          sourceLanguageCode: languagePair.source_language_code,
          targetLanguageCode: languagePair.target_language_code,
          isAcceptingEditors: languagePair.is_accepting_new_editors,
        },
      });

      // console.log(`\tSuccessfully upserted languagePair "${languagePair.id}" - "${languagePair.name}"`);
    } catch (e) {
      console.error(
        `\t❌ Failed to upsert a languagePair "${languagePair.id}" - "${languagePair.source_language_code}" - "${languagePair.target_language_code}"`,
        e,
      );
      throw e;
    }
  }
  console.log('✅ LANGUAGE PAIRS UPSERTED');
}
