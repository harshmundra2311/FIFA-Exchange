"use server";

import prisma from "../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

export async function settleMatch(teamAId: string, teamBId: string, goalsA: number, goalsB: number, stage: string, isEliminationMatch: boolean = false) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const teamA = await tx.team.findUnique({ where: { id: teamAId } });
      const teamB = await tx.team.findUnique({ where: { id: teamBId } });

      if (!teamA || !teamB) throw new Error("Teams not found");

      // Try to find existing pending match
      const existingMatch = await tx.match.findFirst({
        where: {
          teamAId,
          teamBId,
          status: "PENDING"
        }
      });

      if (existingMatch) {
        await tx.match.update({
          where: { id: existingMatch.id },
          data: {
            status: "COMPLETED",
            goalsA,
            goalsB,
          }
        });
      } else {
        await tx.match.create({
          data: {
            teamAId,
            teamBId,
            stage,
            status: "COMPLETED",
            goalsA,
            goalsB,
          }
        });
      }

      // Win logic
      let winDrawLossA = teamA.winDrawLoss.split("-").map(Number);
      let winDrawLossB = teamB.winDrawLoss.split("-").map(Number);
      
      let modifierA = 0;
      let modifierB = 0;

      let liquidateA = false;
      let liquidateB = false;

      if (goalsA > goalsB) {
        winDrawLossA[0]++; winDrawLossB[2]++;
        
        if (teamA.tier === 1) modifierA += 150;
        else if (teamA.tier === 2) modifierA += 250;
        else if (teamA.tier === 3) modifierA += 350;
        else modifierA += 500;

        if (isEliminationMatch) {
          liquidateB = true;
        } else {
          modifierB -= 250;
        }
      } else if (goalsA < goalsB) {
        winDrawLossA[2]++; winDrawLossB[0]++;
        
        if (teamB.tier === 1) modifierB += 150;
        else if (teamB.tier === 2) modifierB += 250;
        else if (teamB.tier === 3) modifierB += 350;
        else modifierB += 500;

        if (isEliminationMatch) {
          liquidateA = true;
        } else {
          modifierA -= 250;
        }
      } else {
        winDrawLossA[1]++; winDrawLossB[1]++;
        modifierA = 100; modifierB = 100;
      }

      // Event Modifiers
      modifierA += (goalsA * 20);
      modifierB += (goalsB * 20);
      modifierA -= (goalsB * 20);
      modifierB -= (goalsA * 20);

      if (goalsB === 0) modifierA += 50;
      if (goalsA === 0) modifierB += 50;

      // Knockout stage bonuses
      const stageLower = stage.toLowerCase();
      if (stageLower.includes("semi") && goalsA > goalsB) modifierA += 300;
      if (stageLower.includes("semi") && goalsB > goalsA) modifierB += 300;
      if (stageLower.includes("final") && !stageLower.includes("semi")) {
        if (goalsA > goalsB) modifierA += 500;
        if (goalsB > goalsA) modifierB += 500;
      }

      // Update A
      if (liquidateA) {
        const newPrice = Math.max(0, teamA.price * 0.25); // 75% crash
        await tx.team.update({
          where: { id: teamAId },
          data: {
            price: newPrice,
            isLocked: true,
            goalsScored: teamA.goalsScored + goalsA,
            goalsConceded: teamA.goalsConceded + goalsB,
            cleanSheets: goalsB === 0 ? teamA.cleanSheets + 1 : teamA.cleanSheets,
            winDrawLoss: winDrawLossA.join("-"),
          }
        });
        const holdingsA = await tx.holding.findMany({ where: { teamId: teamAId } });
        for (const h of holdingsA) {
          const payout = h.shares * newPrice;
          await tx.user.update({ where: { id: h.userId }, data: { cashBalance: { increment: payout } } });
          await tx.transaction.create({ data: { userId: h.userId, teamId: teamAId, type: "SELL", shares: h.shares, price: newPrice } });
          await tx.holding.delete({ where: { id: h.id } });
        }
      } else {
        await tx.team.update({
          where: { id: teamAId },
          data: {
            price: Math.max(0, teamA.price + modifierA),
            goalsScored: teamA.goalsScored + goalsA,
            goalsConceded: teamA.goalsConceded + goalsB,
            cleanSheets: goalsB === 0 ? teamA.cleanSheets + 1 : teamA.cleanSheets,
            winDrawLoss: winDrawLossA.join("-"),
          }
        });
      }

      // Update B
      if (liquidateB) {
        const newPrice = Math.max(0, teamB.price * 0.25); // 75% crash
        await tx.team.update({
          where: { id: teamBId },
          data: {
            price: newPrice,
            isLocked: true,
            goalsScored: teamB.goalsScored + goalsB,
            goalsConceded: teamB.goalsConceded + goalsA,
            cleanSheets: goalsA === 0 ? teamB.cleanSheets + 1 : teamB.cleanSheets,
            winDrawLoss: winDrawLossB.join("-"),
          }
        });
        const holdingsB = await tx.holding.findMany({ where: { teamId: teamBId } });
        for (const h of holdingsB) {
          const payout = h.shares * newPrice;
          await tx.user.update({ where: { id: h.userId }, data: { cashBalance: { increment: payout } } });
          await tx.transaction.create({ data: { userId: h.userId, teamId: teamBId, type: "SELL", shares: h.shares, price: newPrice } });
          await tx.holding.delete({ where: { id: h.id } });
        }
      } else {
        await tx.team.update({
          where: { id: teamBId },
          data: {
            price: Math.max(0, teamB.price + modifierB),
            goalsScored: teamB.goalsScored + goalsB,
            goalsConceded: teamB.goalsConceded + goalsA,
            cleanSheets: goalsA === 0 ? teamB.cleanSheets + 1 : teamB.cleanSheets,
            winDrawLoss: winDrawLossB.join("-"),
          }
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to settle match" };
  }
}

export async function setTeamsLock(locked: boolean) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.team.updateMany({
      data: { isLocked: locked }
    });
    return { success: true };
  } catch (error) {
    return { error: "Failed to update lock status" };
  }
}
export async function liquidateTeam(teamId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const team = await tx.team.findUnique({ where: { id: teamId } });
      if (!team) throw new Error("Team not found");

      const newPrice = Math.max(0, team.price * 0.25); // 75% crash

      await tx.team.update({
        where: { id: teamId },
        data: {
          price: newPrice,
          isLocked: true // permanently freeze
        }
      });
      
      const holdings = await tx.holding.findMany({ where: { teamId } });
      for (const h of holdings) {
        const payout = h.shares * newPrice;
        await tx.user.update({ where: { id: h.userId }, data: { cashBalance: { increment: payout } } });
        await tx.transaction.create({ data: { userId: h.userId, teamId, type: "SELL", shares: h.shares, price: newPrice } });
        await tx.holding.delete({ where: { id: h.id } });
      }
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to liquidate team" };
  }
}

export async function revertMatch(matchId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({ where: { id: matchId } });
      if (!match || match.status !== "COMPLETED") throw new Error("Match not found or not completed");

      const teamA = await tx.team.findUnique({ where: { id: match.teamAId } });
      const teamB = await tx.team.findUnique({ where: { id: match.teamBId } });

      if (!teamA || !teamB) throw new Error("Teams not found");

      let winDrawLossA = teamA.winDrawLoss.split("-").map(Number);
      let winDrawLossB = teamB.winDrawLoss.split("-").map(Number);

      let modifierA = 0;
      let modifierB = 0;

      let baseModifierA = 0;
      let baseModifierB = 0;

      if (match.goalsA > match.goalsB) {
        winDrawLossA[0] = Math.max(0, winDrawLossA[0] - 1);
        winDrawLossB[2] = Math.max(0, winDrawLossB[2] - 1);
        
        if (teamA.tier === 1) baseModifierA += 150;
        else if (teamA.tier === 2) baseModifierA += 250;
        else if (teamA.tier === 3) baseModifierA += 350;
        else baseModifierA += 500;

        // Note: Reverting a true liquidation is not fully supported, we just revert the group loss.
        baseModifierB -= 250;
      } else if (match.goalsA < match.goalsB) {
        winDrawLossA[2] = Math.max(0, winDrawLossA[2] - 1);
        winDrawLossB[0] = Math.max(0, winDrawLossB[0] - 1);
        
        if (teamB.tier === 1) baseModifierB += 150;
        else if (teamB.tier === 2) baseModifierB += 250;
        else if (teamB.tier === 3) baseModifierB += 350;
        else baseModifierB += 500;

        baseModifierA -= 250;
      } else {
        winDrawLossA[1] = Math.max(0, winDrawLossA[1] - 1);
        winDrawLossB[1] = Math.max(0, winDrawLossB[1] - 1);
        baseModifierA += 100;
        baseModifierB += 100;
      }

      baseModifierA += (match.goalsA * 20);
      baseModifierB += (match.goalsB * 20);
      baseModifierA -= (match.goalsB * 20);
      baseModifierB -= (match.goalsA * 20);

      if (match.goalsB === 0) baseModifierA += 50;
      if (match.goalsA === 0) baseModifierB += 50;

      const stageLower = match.stage.toLowerCase();
      if (stageLower.includes("semi") && match.goalsA > match.goalsB) baseModifierA += 300;
      if (stageLower.includes("semi") && match.goalsB > match.goalsA) baseModifierB += 300;
      if (stageLower.includes("final") && !stageLower.includes("semi")) {
        if (match.goalsA > match.goalsB) baseModifierA += 500;
        if (match.goalsB > match.goalsA) baseModifierB += 500;
      }

      modifierA = -baseModifierA;
      modifierB = -baseModifierB;

      await tx.team.update({
        where: { id: teamA.id },
        data: {
          price: Math.max(0, teamA.price + modifierA),
          goalsScored: Math.max(0, teamA.goalsScored - match.goalsA),
          goalsConceded: Math.max(0, teamA.goalsConceded - match.goalsB),
          cleanSheets: match.goalsB === 0 ? Math.max(0, teamA.cleanSheets - 1) : teamA.cleanSheets,
          winDrawLoss: winDrawLossA.join("-"),
        }
      });

      await tx.team.update({
        where: { id: teamB.id },
        data: {
          price: Math.max(0, teamB.price + modifierB),
          goalsScored: Math.max(0, teamB.goalsScored - match.goalsB),
          goalsConceded: Math.max(0, teamB.goalsConceded - match.goalsA),
          cleanSheets: match.goalsA === 0 ? Math.max(0, teamB.cleanSheets - 1) : teamB.cleanSheets,
          winDrawLoss: winDrawLossB.join("-"),
        }
      });

      await tx.match.update({
        where: { id: matchId },
        data: {
          status: "PENDING"
        }
      });
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to revert match" };
  }
}
