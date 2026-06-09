import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const code = await prisma.inviteCode.findFirst({
    where: { isUsed: false }
  });
  console.log("INVITE_CODE:", code?.code);
}

main().catch(console.error).finally(() => prisma.$disconnect());
