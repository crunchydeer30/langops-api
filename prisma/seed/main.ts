import { PrismaClient } from '@prisma/client';
import { seedLanguages } from './language/seed';
import { seedLanguagePairs } from './language-pair/seed';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await seedLanguages(tx);
    await seedLanguagePairs(tx);
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
