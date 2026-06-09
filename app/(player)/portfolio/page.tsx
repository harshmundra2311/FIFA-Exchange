"use client";

import Portfolio from '@/src/components/Portfolio';
import { useGame } from '@/src/lib/GameContext';
import { useRouter } from 'next/navigation';

export default function PortfolioPage() {
  const { teams, holdings, transactions, cash, portfolioValue } = useGame();
  const router = useRouter();

  const handleViewChange = (view: string) => {
    if (view === 'dashboard') router.push('/');
    else router.push(`/${view}`);
  };

  const handleSelectTeam = (id: string) => {
    router.push(`/team/${id}`);
  };

  return (
    <Portfolio
      teams={teams}
      holdings={holdings}
      transactions={transactions}
      cash={cash}
      portfolioValue={portfolioValue}
      onViewChange={handleViewChange}
      onSelectTeam={handleSelectTeam}
    />
  );
}
