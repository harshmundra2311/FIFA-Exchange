import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rawMatches = [
  { t1: "Mexico", t2: "South Africa", time: "2026-06-12T00:30:00+05:30" },
  { t1: "Korea Republic", t2: "Czechia", time: "2026-06-12T07:30:00+05:30" },
  { t1: "Canada", t2: "Bosnia & Herzegovina", time: "2026-06-13T00:30:00+05:30" },
  { t1: "USA", t2: "Paraguay", time: "2026-06-13T06:30:00+05:30" },
  { t1: "Qatar", t2: "Switzerland", time: "2026-06-14T00:30:00+05:30" },
  { t1: "Brazil", t2: "Morocco", time: "2026-06-14T03:30:00+05:30" },
  { t1: "Haiti", t2: "Scotland", time: "2026-06-14T06:30:00+05:30" },
  { t1: "Australia", t2: "Türkiye", time: "2026-06-14T09:30:00+05:30" },
  { t1: "Germany", t2: "Curaçao", time: "2026-06-14T22:30:00+05:30" },
  { t1: "Netherlands", t2: "Japan", time: "2026-06-15T01:30:00+05:30" },
  { t1: "Côte d'Ivoire", t2: "Ecuador", time: "2026-06-15T04:30:00+05:30" },
  { t1: "Sweden", t2: "Tunisia", time: "2026-06-15T07:30:00+05:30" },
  { t1: "Spain", t2: "Cabo Verde", time: "2026-06-15T21:30:00+05:30" },
  { t1: "Belgium", t2: "Egypt", time: "2026-06-16T00:30:00+05:30" },
  { t1: "Saudi Arabia", t2: "Uruguay", time: "2026-06-16T03:30:00+05:30" },
  { t1: "Iran", t2: "New Zealand", time: "2026-06-16T06:30:00+05:30" },
];

async function main() {
  console.log("Deleting old matches...");
  await prisma.match.deleteMany({});
  console.log("Deleted old matches.");

  const teams = await prisma.team.findMany();
  
  const findTeam = (name: string) => {
    const t = teams.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (t) return t.id;
    
    // Fuzzy fallback
    if (name === "Korea Republic") return teams.find(t => t.name.includes("Korea"))?.id;
    if (name === "Côte d'Ivoire") return teams.find(t => t.name.includes("Ivoire") || t.name.includes("Ivory"))?.id;
    if (name === "Türkiye") return teams.find(t => t.name.includes("Turk"))?.id;
    if (name === "Czechia") return teams.find(t => t.name.includes("Czech"))?.id;
    if (name === "Bosnia & Herzegovina") return teams.find(t => t.name.includes("Bosnia"))?.id;
    if (name === "Cabo Verde") return teams.find(t => t.name.includes("Cabo") || t.name.includes("Cape"))?.id;
    if (name === "USA") return teams.find(t => t.name === "United States")?.id;

    return null;
  };

  for (const m of rawMatches) {
    const id1 = findTeam(m.t1);
    const id2 = findTeam(m.t2);

    if (!id1) { console.error(`Team not found: ${m.t1}`); continue; }
    if (!id2) { console.error(`Team not found: ${m.t2}`); continue; }

    await prisma.match.create({
      data: {
        teamAId: id1,
        teamBId: id2,
        kickoffTime: new Date(m.time),
        stage: 'Group Stage',
        status: 'PENDING'
      }
    });
    console.log(`Created match: ${m.t1} vs ${m.t2}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
