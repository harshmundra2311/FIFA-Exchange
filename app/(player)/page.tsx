"use client";

import Dashboard from '@/src/components/Dashboard';
import { useGame } from '@/src/lib/GameContext';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { teams, holdings, cash, portfolioValue, changePercent24h, changeAmount24h, rank, sparklinePoints, matchesPending } = useGame();
  const router = useRouter();

  const handleSelectTeam = (id: string) => {
    router.push(`/team/${id}`);
  };

  const handleViewChange = (view: string) => {
    if (view === 'dashboard') router.push('/');
    else router.push(`/${view}`);
  };

  return (
    <Dashboard
      teams={teams}
      holdings={holdings}
      cash={cash}
      portfolioValue={portfolioValue}
      onViewChange={handleViewChange}
      onSelectTeam={handleSelectTeam}
      changePercent24h={changePercent24h}
      changeAmount24h={changeAmount24h}
      rank={rank}
      sparklinePoints={sparklinePoints}
      matchesPending={matchesPending}
    />
  );
}
