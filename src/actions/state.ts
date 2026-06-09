"use server";

import prisma from "../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";

export async function getGameState() {
  const session = await getServerSession(authOptions);
  
  // Fetch teams globally
  const rawTeams = await prisma.team.findMany({
    orderBy: { price: "desc" }
  });

  // Map JSON strings back to arrays
  const teams = rawTeams.map(t => ({
    id: t.id,
    name: t.name,
    code: t.code,
    flagUrl: t.flagUrl,
    tier: t.tier,
    price: t.price,
    priceChange24h: t.priceChange24h,
    group: t.groupName,
    matchday: t.matchday,
    isLocked: t.isLocked,
    stats: {
      goalsScored: t.goalsScored,
      goalsConceded: t.goalsConceded,
      cleanSheets: t.cleanSheets,
      winDrawLoss: t.winDrawLoss
    },
    history: JSON.parse(t.historyJson),
    fixtures: JSON.parse(t.fixturesJson),
  }));

  // Fetch matches
  const pendingMatchesQuery = await prisma.match.findMany({
    where: { status: "PENDING" }
  });

  const completedMatchesQuery = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    orderBy: { id: "desc" }
  });

  const mapMatch = (m: any) => ({
    id: m.id,
    teamAId: m.teamAId,
    teamBId: m.teamBId,
    stage: m.stage,
    goalsA: m.goalsA,
    goalsB: m.goalsB,
    isCompleted: m.status === "COMPLETED",
    kickoffTime: m.kickoffTime ? m.kickoffTime.toISOString() : null,
    stats: []
  });

  const matchesPending = pendingMatchesQuery.map(mapMatch);
  const matchesCompleted = completedMatchesQuery.map(mapMatch);



  // Auth specific state
  if (!session?.user?.id) {
    return {
      teams,
      matchesPending,
      matchesCompleted,
      holdings: [],
      cash: 0,
      portfolioValue: 0,
      changePercent24h: 0,
      sparklinePoints: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
      transactions: [],
      isAdmin: false,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      holdings: {
        include: { team: true }
      },
      transactions: {
        include: { team: true },
        orderBy: { timestamp: "desc" },
        take: 50,
      }
    }
  });

  if (!user) {
    return { teams, matchesPending, matchesCompleted, holdings: [], cash: 0, portfolioValue: 0, changePercent24h: 0, sparklinePoints: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000], transactions: [], isAdmin: false };
  }

  const holdings = user.holdings.map(h => ({
    id: h.id,
    team: teams.find(t => t.id === h.teamId)!,
    teamId: h.teamId,
    shares: h.shares,
    averageBuyPrice: h.averageBuyPrice,
    avgPrice: h.averageBuyPrice,
    currentValue: h.shares * h.team.price,
    totalReturn: (h.shares * h.team.price) - (h.shares * h.averageBuyPrice)
  }));

  const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0) + user.cashBalance;

  const historyLengths = holdings.map(h => h.team.history.length);
  const maxHistoryPoints = historyLengths.length > 0 ? Math.max(...historyLengths) : 10;
  
  const historicalPortfolioValues: number[] = [];
  for (let i = 0; i < maxHistoryPoints; i++) {
    let pastValue = user.cashBalance;
    for (const h of holdings) {
      const teamHistory = h.team.history;
      const priceIndex = Math.max(0, teamHistory.length - maxHistoryPoints + i);
      const pastPrice = teamHistory[priceIndex] || h.team.price;
      pastValue += h.shares * pastPrice;
    }
    historicalPortfolioValues.push(pastValue);
  }
  
  if (holdings.length === 0) {
    for (let i = 0; i < 10; i++) {
      if (historicalPortfolioValues.length < 10) historicalPortfolioValues.push(user.cashBalance);
    }
  }

  const oldestValue = 10000; // Starting baseline
  const changePercent24h = ((portfolioValue - oldestValue) / oldestValue) * 100;
  const changeAmount24h = portfolioValue - oldestValue;

  const minVal = Math.min(...historicalPortfolioValues);
  const maxVal = Math.max(...historicalPortfolioValues);
  const range = maxVal - minVal || 1;
  
  const sparklinePoints = historicalPortfolioValues.map((val, idx) => {
    const x = (idx / (historicalPortfolioValues.length - 1 || 1)) * 100;
    const normalizedY = (val - minVal) / range;
    const y = 100 - (normalizedY * 80 + 10);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const transactions = user.transactions.map(t => ({
    id: t.id,
    type: t.type as "BUY" | "SELL",
    team: teams.find(tm => tm.id === t.teamId)!,
    shares: t.shares,
    price: t.price,
    timestamp: t.timestamp.toISOString(),
  }));

  const allUsers = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      holdings: { include: { team: true } }
    }
  });
  const rankedUsers = allUsers.map(u => {
    const pValue = u.cashBalance + u.holdings.reduce((sum, h) => sum + (h.shares * h.team.price), 0);
    return { 
      id: u.id, 
      portfolioValue: pValue,
      traderName: u.fullName || u.username,
      avatarUrl: u.avatarSeed?.includes('/') ? u.avatarSeed : `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatarSeed}&backgroundColor=00F59B`,
      holdings: u.holdings.length
    };
  }).sort((a, b) => b.portfolioValue - a.portfolioValue);
  
  let currentRank = 1;
  let currentPValue = rankedUsers[0]?.portfolioValue;
  for (let i = 0; i < rankedUsers.length; i++) {
    if (rankedUsers[i].portfolioValue < currentPValue) {
      currentRank = i + 1;
      currentPValue = rankedUsers[i].portfolioValue;
    }
    (rankedUsers[i] as any).rank = currentRank;
  }
  const userRankObj = rankedUsers.find(u => u.id === session.user.id);
  const rank = userRankObj ? (userRankObj as any).rank : 1;

  const leaderboard = rankedUsers.map((u: any) => ({
    rank: u.rank,
    traderName: u.traderName,
    avatarUrl: u.avatarUrl,
    value: u.portfolioValue,
    returnPct: ((u.portfolioValue - 10000) / 10000) * 100,
    holdings: u.holdings,
    isCurrentUser: u.id === session.user.id
  }));

  return {
    teams,
    matchesPending,
    matchesCompleted,
    holdings,
    cash: user.cashBalance,
    portfolioValue,
    transactions,
    isAdmin: user.role === "ADMIN",
    createdAt: user.createdAt.toISOString(),
    rank,
    leaderboard,
    changePercent24h,
    changeAmount24h,
    sparklinePoints: historicalPortfolioValues,
  };
}
