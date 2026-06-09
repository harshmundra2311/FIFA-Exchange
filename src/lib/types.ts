export interface Team {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  tier: 1 | 2 | 3 | 4;
  price: number;
  priceChange24h: number;
  group: string;
  matchday: string;
  isLocked: boolean;
  stats: {
    goalsScored: number;
    goalsConceded: number;
    cleanSheets: number;
    winDrawLoss: string; // e.g. "3-0-0"
  };
  history: number[]; // 1D, 1W price data values (e.g., length 11)
  fixtures: {
    stage: string;
    opponent: string;
    score: string;
    profit: number;
    isPending?: boolean;
  }[];
}

export interface Holding {
  teamId: string;
  shares: number;
  avgPrice: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  teamId: string;
  shares: number;
  price: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  traderName: string;
  avatarUrl: string;
  value: number;
  returnPct: number;
  holdings: number;
  isCurrentUser?: boolean;
}

export interface MatchPending {
  id: string;
  teamAId: string;
  teamBId: string;
  goalsA: number;
  goalsB: number;
  stage: string;
  isCompleted: boolean;
  stats: string[]; // e.g., ["ESP (2)", "GER (1)"] or ["Clean Sheet", "JPN Penalties"]
  kickoffTime?: string | null;
}

export interface AuditLogItem {
  id: string;
  source: 'SYSTEM AUTO' | 'ADMIN (ROOT)';
  timestamp: string;
  message: string;
  borderColor: string; // e.g. "border-world-cup-green", "border-error", "border-secondary-fixed-dim"
}

export type ViewType = 'dashboard' | 'market' | 'portfolio' | 'leaderboard' | 'standings' | 'schedule' | 'settlement' | 'detail' | 'profile';
