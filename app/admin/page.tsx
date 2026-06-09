"use client";

import Settlement from '@/src/components/Settlement';
import { useGame } from '@/src/lib/GameContext';

export default function AdminSettlementPage() {
  const { teams, matchesPending, matchesCompleted, auditLogs, handleSettleMatch, handleForceSettle, handleLiquidateTeam, handleRevertMatch } = useGame();

  return (
    <Settlement
      teams={teams}
      matchesPending={matchesPending}
      matchesCompleted={matchesCompleted}
      auditLogs={auditLogs}
      onSettleMatch={handleSettleMatch}
      onForceSettle={handleForceSettle}
      onLiquidateTeam={handleLiquidateTeam}
      onRevertMatch={handleRevertMatch}
    />
  );
}
