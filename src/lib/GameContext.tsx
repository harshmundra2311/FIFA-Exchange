"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Team, Holding, Transaction, MatchPending, AuditLogItem, LeaderboardEntry } from './types';
import { INITIAL_TEAMS, INITIAL_HOLDINGS, INITIAL_TRANSACTIONS, INITIAL_MATCHES_PENDING, INITIAL_AUDIT_LOGS } from './data';
import { getGameState } from '@/src/actions/state';
import { buyShares, sellShares } from '@/src/actions/trade';
import { settleMatch, liquidateTeam, revertMatch } from '@/src/actions/admin';
import { useSession } from 'next-auth/react';

interface GameContextType {
  teams: Team[];
  holdings: Holding[];
  transactions: Transaction[];
  matchesPending: MatchPending[];
  matchesCompleted: MatchPending[];
  auditLogs: AuditLogItem[];
  cash: number;
  stockValue: number;
  portfolioValue: number;
  changePercent24h: number;
  changeAmount24h: number;
  leaderboard: LeaderboardEntry[];
  sparklinePoints: number[];
  isAdminMode: boolean;
  rank: number;
  createdAt: string;
  handleTradeConfirm: (type: 'BUY' | 'SELL', teamId: string, shares: number, price: number) => Promise<void>;
  handleSettleMatch: (matchId: string, goalsA: number, goalsB: number, teamAId: string, teamBId: string, wentToPenalties?: boolean) => Promise<void>;
  handleForceSettle: (teamAId: string, teamBId: string, goalsA: number, goalsB: number, wentToPenalties: boolean, wentToElimination: boolean) => Promise<void>;
  handleLiquidateTeam: (teamId: string) => Promise<void>;
  handleRevertMatch: (matchId: string) => Promise<void>;
  refreshState: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [matchesPending, setMatchesPending] = useState<MatchPending[]>(INITIAL_MATCHES_PENDING);
  const [matchesCompleted, setMatchesCompleted] = useState<MatchPending[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [cash, setCash] = useState<number>(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [rank, setRank] = useState<number>(0);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [changePercent24h, setChangePercent24h] = useState<number>(0);
  const [changeAmount24h, setChangeAmount24h] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sparklinePoints, setSparklinePoints] = useState<number[]>([]);

  const refreshState = useCallback(async () => {
    try {
      const state = await getGameState();
      setTeams(state.teams as any);
      setHoldings(state.holdings as any);
      setTransactions(state.transactions as any);
      setCash(state.cash);
      setIsAdminMode(state.isAdmin);
      if (state.rank) setRank(state.rank);
      if (state.matchesPending) setMatchesPending(state.matchesPending);
      if (state.matchesCompleted) setMatchesCompleted(state.matchesCompleted);
      if (state.cash !== undefined) setCash(state.cash);
      if (state.createdAt) setCreatedAt(state.createdAt);
      if (state.changePercent24h !== undefined) setChangePercent24h(state.changePercent24h);
      if (state.changeAmount24h !== undefined) setChangeAmount24h(state.changeAmount24h);
      if (state.leaderboard) setLeaderboard(state.leaderboard);
      if (state.sparklinePoints) setSparklinePoints(state.sparklinePoints as number[]);
    } catch (err) {
      console.error("Failed to fetch game state:", err);
    }
  }, []);

  useEffect(() => {
    refreshState();
    // Poll every 10 seconds for live updates
    const interval = setInterval(refreshState, 10000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const stockValue = useMemo(() => {
    return holdings.reduce((sum, h) => {
      const team = teams.find(t => t.id === h.teamId);
      return sum + (team ? h.shares * team.price : 0);
    }, 0);
  }, [holdings, teams]);

  const portfolioValue = useMemo(() => {
    return cash + stockValue;
  }, [cash, stockValue]);

  const handleTradeConfirm = async (type: 'BUY' | 'SELL', teamId: string, shares: number, price: number) => {
    if (type === 'BUY') {
      await buyShares(teamId, shares);
    } else {
      await sellShares(teamId, shares);
    }
    await refreshState();
  };

  const handleSettleMatch = async (matchId: string, goalsA: number, goalsB: number, teamAId: string, teamBId: string, wentToPenalties?: boolean) => {
    await settleMatch(teamAId, teamBId, goalsA, goalsB, "Group Stage");
    await refreshState();
  };

  const handleForceSettle = async (teamAId: string, teamBId: string, goalsA: number, goalsB: number, wentToPenalties: boolean, wentToElimination: boolean) => {
    await settleMatch(teamAId, teamBId, goalsA, goalsB, "Group Stage", wentToElimination);
    await refreshState();
  };

  const handleLiquidateTeam = async (teamId: string) => {
    await liquidateTeam(teamId);
    await refreshState();
  };

  const handleRevertMatch = async (matchId: string) => {
    if (confirm("Are you sure you want to REVERT this match? This will undo the team stock price changes and set the match back to PENDING. User portfolios will automatically re-adjust.")) {
      await revertMatch(matchId);
      await refreshState();
    }
  };

  return (
    <GameContext.Provider value={{
      teams,
      holdings,
      transactions,
      matchesPending,
      matchesCompleted,
      auditLogs,
      cash,
      stockValue,
      portfolioValue,
      changePercent24h,
      changeAmount24h,
      leaderboard,
      sparklinePoints,
      isAdminMode,
      rank,
      createdAt,
      handleTradeConfirm,
      handleSettleMatch,
      handleForceSettle,
      handleLiquidateTeam,
      handleRevertMatch,
      refreshState
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
