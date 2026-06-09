import { PrismaClient } from '@prisma/client';
import { INITIAL_TEAMS } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting all teams to initial baseline prices and stats...");
  for (const team of INITIAL_TEAMS) {
    await prisma.team.update({
      where: { id: team.id },
      data: {
        price: team.price,
        priceChange24h: 0,
        goalsScored: 0,
        goalsConceded: 0,
        cleanSheets: 0,
        winDrawLoss: '0-0-0',
        historyJson: JSON.stringify([team.price, team.price]),
        fixturesJson: '[]',
        matchday: 'Matchday 1',
        isLocked: false
      }
    });
  }
  console.log('All 50 teams have been reset successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
