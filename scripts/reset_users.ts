import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting test users...");

  const users = await prisma.user.findMany({ where: { role: 'USER' } });
  const userIds = users.map(u => u.id);

  if (userIds.length > 0) {
    // Delete their transactions
    await prisma.transaction.deleteMany({
      where: { userId: { in: userIds } }
    });

    // Delete their holdings
    await prisma.holding.deleteMany({
      where: { userId: { in: userIds } }
    });

    // Delete the users
    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
    
    console.log(`Deleted ${userIds.length} test user profiles.`);
  } else {
    console.log("No test users found to delete.");
  }

  // Delete old invite codes
  await prisma.inviteCode.deleteMany();
  console.log("Cleared old invite codes.");

  // Generate 20 new invite codes for deployment
  const codes = Array.from({ length: 20 }, () => "BETA-" + Math.random().toString(36).substring(2, 6).toUpperCase());

  await prisma.inviteCode.createMany({
    data: codes.map(code => ({ code }))
  });

  console.log("\n=========================");
  console.log("NEW INVITE CODES GENERATED FOR LAUNCH:");
  codes.forEach((code, i) => console.log(`${i + 1}. ${code}`));
  console.log("=========================\n");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
