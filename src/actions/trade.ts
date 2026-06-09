"use server";

import prisma from "../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

export async function buyShares(teamId: string, shares: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const team = await tx.team.findUnique({ where: { id: teamId } });

      if (!user || !team) return { error: "User or Team not found" };
      if (team.isLocked) return { error: "Trading is locked for this team" };

      const totalCost = shares * team.price;
      if (user.cashBalance < totalCost) return { error: "Insufficient funds" };

      // Deduct cash
      await tx.user.update({
        where: { id: userId },
        data: { cashBalance: { decrement: totalCost } },
      });

      // Add to holding
      const existingHolding = await tx.holding.findUnique({
        where: { userId_teamId: { userId, teamId } },
      });

      if (existingHolding) {
        // Recalculate average buy price
        const totalValueOld = existingHolding.shares * existingHolding.averageBuyPrice;
        const totalValueNew = totalValueOld + totalCost;
        const newShares = existingHolding.shares + shares;
        const newAvgPrice = totalValueNew / newShares;

        await tx.holding.update({
          where: { id: existingHolding.id },
          data: {
            shares: newShares,
            averageBuyPrice: newAvgPrice,
          },
        });
      } else {
        await tx.holding.create({
          data: {
            userId,
            teamId,
            shares,
            averageBuyPrice: team.price,
          },
        });
      }

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          teamId,
          type: "BUY",
          shares,
          price: team.price,
        },
      });

      return { success: true };
    });
  } catch (error) {
    console.error("Buy error:", error);
    return { error: "Transaction failed" };
  }
}

export async function sellShares(teamId: string, sharesToSell: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const team = await tx.team.findUnique({ where: { id: teamId } });
      const holding = await tx.holding.findUnique({ where: { userId_teamId: { userId, teamId } } });

      if (!user || !team || !holding) return { error: "Invalid transaction" };
      if (team.isLocked) return { error: "Trading is locked for this team" };
      if (holding.shares < sharesToSell) return { error: "Not enough shares" };

      const totalRevenue = sharesToSell * team.price;

      // Add cash
      await tx.user.update({
        where: { id: userId },
        data: { cashBalance: { increment: totalRevenue } },
      });

      // Deduct or remove holding
      if (holding.shares === sharesToSell) {
        await tx.holding.delete({ where: { id: holding.id } });
      } else {
        await tx.holding.update({
          where: { id: holding.id },
          data: { shares: { decrement: sharesToSell } },
        });
      }

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          teamId,
          type: "SELL",
          shares: sharesToSell,
          price: team.price,
        },
      });

      return { success: true };
    });
  } catch (error) {
    console.error("Sell error:", error);
    return { error: "Transaction failed" };
  }
}
