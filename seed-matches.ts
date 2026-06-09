import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const matches = await prisma.match.findMany({ where: { status: 'PENDING' } });
  let minutes = 45;
  for (const match of matches) {
    const kickoff = new Date();
    kickoff.setMinutes(kickoff.getMinutes() + minutes);
    await prisma.match.update({
      where: { id: match.id },
      data: { kickoffTime: kickoff }
    });
    minutes += 90;
  }
  console.log('Matches seeded with kickoff times.');
}
main().finally(() => prisma.$disconnect());
