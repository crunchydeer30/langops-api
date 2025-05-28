import { Prisma } from '@prisma/client';
import * as data from './data.json';

export async function seedLanguages(prisma: Prisma.TransactionClient) {
  console.log('⏳ UPSERTING LANGUAGES...');

  for (const language of data) {
    try {
      // console.log(`\tUpserting language "${language.id}" - "${language.name}..."`);

      await prisma.language.upsert({
        where: {
          code: language.code,
        },
        update: {
          name: language.name,
        },
        create: {
          code: language.code,
          name: language.name,
        },
      });

      // console.log(`\tSuccessfully upserted language "${language.id}" - "${language.name}"`);
    } catch (e) {
      console.error(
        `\t❌ Failed to upsert a language "${language.code}" - "${language.name}"`,
        e,
      );
      throw e;
    }
  }
  console.log('✅ LANGUAGES UPSERTED');
}
