import { PrismaClient } from '@prisma/client';
import { seedLanguages } from './language/seed';
import { seedLanguagePairs } from './language-pair/seed';
import { seedSampleEvaluationContent } from './tasks-for-evaluation/seed';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await seedLanguages(tx);
    await seedLanguagePairs(tx);
    await seedSampleEvaluationContent(tx);
  });
}

main()
  .catch((e) => {
    console.error(`❌ Error during seed: ${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
