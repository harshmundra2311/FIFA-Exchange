import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { INITIAL_TEAMS } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      cashBalance: 9999999, // Admin has unlimited funds for testing, or doesn't matter
    },
  });
  console.log('Created admin user:', adminUser.username);

  // 2. Generate 50 unique invite codes
  const inviteCodesCount = await prisma.inviteCode.count();
  if (inviteCodesCount === 0) {
    const codesData = [];
    for (let i = 1; i <= 50; i++) {
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      codesData.push({ code: `FIFA-${randomString}-${i}` });
    }
    await prisma.inviteCode.createMany({
      data: codesData,
    });
    console.log(`Generated ${codesData.length} invite codes.`);
  }

  // 3. Populate 48 Teams
  for (const team of INITIAL_TEAMS) {
    await prisma.team.upsert({
      where: { id: team.id },
      update: {
        price: team.price, // update price in case it changed in data.ts
      },
      create: {
        id: team.id,
        name: team.name,
        code: team.code,
        flagUrl: team.flagUrl,
        tier: team.tier,
        price: team.price,
        priceChange24h: team.priceChange24h,
        groupName: team.group,
        matchday: team.matchday,
        isLocked: team.isLocked,
        goalsScored: team.stats.goalsScored,
        goalsConceded: team.stats.goalsConceded,
        cleanSheets: team.stats.cleanSheets,
        winDrawLoss: team.stats.winDrawLoss,
        historyJson: JSON.stringify(team.history),
        fixturesJson: JSON.stringify(team.fixtures),
      },
    });
  }
  console.log('Populated 48 teams.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
