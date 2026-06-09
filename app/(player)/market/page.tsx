"use client";

import Market from '@/src/components/Market';
import { useGame } from '@/src/lib/GameContext';
import { useRouter } from 'next/navigation';

export default function MarketPage() {
  const { teams } = useGame();
  const router = useRouter();

  const handleSelectTeam = (id: string) => {
    router.push(`/team/${id}`);
  };

  return <Market teams={teams} onSelectTeam={handleSelectTeam} />;
}
