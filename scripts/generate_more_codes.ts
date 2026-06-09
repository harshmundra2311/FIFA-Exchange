import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = "postgresql://postgres:HarshMundra%4023@db.offmhgfxmeildfsniens.supabase.co:5432/postgres";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.inviteCode.count();
  const needed = Math.max(0, 50 - count);
  
  if (needed > 0) {
    const codes = Array.from({ length: needed }, () => "BETA-" + Math.random().toString(36).substring(2, 6).toUpperCase());
    
    await prisma.inviteCode.createMany({
      data: codes.map(code => ({ code }))
    });
    
    console.log(`\n=========================`);
    console.log(`GENERATED ${needed} MORE CODES:`);
    codes.forEach((c, i) => console.log(`${count + i + 1}. ${c}`));
    console.log(`=========================\n`);
  } else {
    console.log("Already have 50 or more codes.");
  }
}

main().finally(() => prisma.$disconnect());
