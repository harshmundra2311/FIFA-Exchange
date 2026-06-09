"use client";

import TeamDetail from '@/src/components/TeamDetail';
import { useGame } from '@/src/lib/GameContext';
import { useRouter, useParams } from 'next/navigation';

export default function TeamDetailPage() {
  const { teams, holdings, cash, handleTradeConfirm, matchesPending } = useGame();
  const router = useRouter();
  const params = useParams();
  
  const teamId = typeof params.id === 'string' ? params.id : '';

  const handleBack = () => {
    router.push('/market');
  };

  const onTrade = (type: 'BUY' | 'SELL', teamId: string, shares: number, price: number) => {
    handleTradeConfirm(type, teamId, shares, price);
    router.push('/portfolio'); // Redirect to portfolio after trade
  };

  return (
    <TeamDetail
      teamId={teamId}
      teams={teams}
      holdings={holdings}
      cash={cash}
      onBack={handleBack}
      onTrade={onTrade}
      matchesPending={matchesPending}
    />
  );
}
