"use client";

import Leaderboard from '@/src/components/Leaderboard';
import { useGame } from '@/src/lib/GameContext';
import { LEADERBOARD } from '@/src/lib/data';

export default function LeaderboardPage() {
  const { portfolioValue, rank, leaderboard } = useGame();

  return (
    <Leaderboard
      entries={leaderboard}
      portfolioValue={portfolioValue}
      rank={rank}
    />
  );
}
