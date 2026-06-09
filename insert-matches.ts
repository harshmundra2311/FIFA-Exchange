import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const kickoff1 = new Date();
  kickoff1.setMinutes(kickoff1.getMinutes() + 45);
  
  const kickoff2 = new Date();
  kickoff2.setMinutes(kickoff2.getMinutes() + 135);

  await prisma.match.create({
    data: {
      teamAId: 'spain',
      teamBId: 'germany',
      stage: 'Group Stage',
      status: 'PENDING',
      kickoffTime: kickoff1
    }
  });

  await prisma.match.create({
    data: {
      teamAId: 'unitedstates',
      teamBId: 'mexico',
      stage: 'Group Stage',
      status: 'PENDING',
      kickoffTime: kickoff2
    }
  });

  console.log('Inserted pending matches.');
}
main().finally(() => prisma.$disconnect());
