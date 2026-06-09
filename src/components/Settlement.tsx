import { useState, FormEvent } from 'react';
import { Gavel, History, Trash, AlertTriangle, Play, ShieldAlert, CheckSquare, RefreshCw } from 'lucide-react';
import { Team, MatchPending, AuditLogItem } from '../lib/types';
import { motion } from 'motion/react';

interface SettlementProps {
  teams: Team[];
  matchesPending: MatchPending[];
  matchesCompleted?: MatchPending[];
  auditLogs: AuditLogItem[];
  onSettleMatch: (matchId: string, goalsA: number, goalsB: number, teamAId: string, teamBId: string, wentToPenalties?: boolean) => void;
  onForceSettle: (teamAId: string, teamBId: string, goalsA: number, goalsB: number, wentToPenalties: boolean, wentToElimination: boolean) => void;
  onLiquidateTeam: (teamId: string) => void;
  onRevertMatch: (matchId: string) => void;
}

export default function Settlement({
  teams,
  matchesPending,
  matchesCompleted,
  auditLogs,
  onSettleMatch,
  onForceSettle,
  onLiquidateTeam,
  onRevertMatch
}: SettlementProps) {
  // Manual override states
  const [overrideTeamA, setOverrideTeamA] = useState('');
  const [overrideTeamB, setOverrideTeamB] = useState('');
  const [goalsA, setGoalsA] = useState(0);
  const [goalsB, setGoalsB] = useState(0);
  const [cleanSheetA, setCleanSheetA] = useState(false);
  const [cleanSheetB, setCleanSheetB] = useState(false);
  const [wentToPenalties, setWentToPenalties] = useState(false);
  const [wentToElimination, setWentToElimination] = useState(false);

  // Bankruptcy state
  const [bankruptTeamId, setBankruptTeamId] = useState('');
  
  // Pending matches scores local state
  const [pendingScores, setPendingScores] = useState<Record<string, {goalsA: number, goalsB: number}>>({});

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  const handleSettle = (match: MatchPending) => {
    const scores = pendingScores[match.id] || { goalsA: 0, goalsB: 0 };
    onSettleMatch(match.id, scores.goalsA, scores.goalsB, match.teamAId, match.teamBId, false);
  };

  // Manual override submit handler
  const handleManualOverride = (e: FormEvent) => {
    e.preventDefault();
    if (!overrideTeamA || !overrideTeamB || overrideTeamA === overrideTeamB) {
      alert('Please select two distinct teams.');
      return;
    }
    onForceSettle(overrideTeamA, overrideTeamB, goalsA, goalsB, wentToPenalties, wentToElimination);
    
    // Reset inputs
    setOverrideTeamA('');
    setOverrideTeamB('');
    setGoalsA(0);
    setGoalsB(0);
    setWentToPenalties(false);
    setWentToElimination(false);
  };

  // Bankruptcy liquidation handler
  const handleLiquidation = () => {
    if (!bankruptTeamId) {
      alert('Please select a team to liquidate.');
      return;
    }
    const team = teams.find(t => t.id === bankruptTeamId);
    if (!team) return;
    
    const confirmText = `Are you absolutely sure you want to LIQUIDATE ${team.name}? This will instantly drop their stock value by 75% and permanently freeze trading!`;
    if (confirm(confirmText)) {
      onLiquidateTeam(bankruptTeamId);
      setBankruptTeamId('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      {/* Title Header Section */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl md:text-5xl text-on-surface uppercase select-none leading-none">
            Match Settlement
          </h1>
          <span className="bg-[#ffb4ab] text-[#690005] font-label-caps text-xs px-2.5 py-1 rounded font-extrabold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 animate-bounce" /> SYSTEM BYPASS
          </span>
        </div>
        <p className="text-body-base text-on-surface-variant mt-2 font-medium">
          Review and settle active matches to trigger dynamic stock price adjustments and portfolio valuation.
        </p>
      </div>

      {/* Main Grid split Left side: Pending & Override, Right side: Quick bankruptcies & logs */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Col span 8) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Section 1: Pending Match Settlement Cards Box */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden border-solid border-[#3b4a3f]/30">
            {/* Ambient visual overlay decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <RefreshCw className="w-48 h-48 animate-spin" style={{ animationDuration: '40s' }} />
            </div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-display text-xl text-white flex items-center gap-2 select-none">
                <span className="w-2.5 h-2.5 rounded-full bg-world-cup-green animate-pulse"></span>
                Pending Settlement
              </h3>
              <span className="bg-[#2f353e] text-[#b9cbbd] font-label-caps text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                {matchesPending.length} Match{matchesPending.length !== 1 ? 'es' : ''} available
              </span>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              {matchesPending.length === 0 ? (
                <div className="text-center py-10 rounded-lg bg-[#0e141c]/50 text-xs text-[#b9cbbd] font-medium">
                  ⚽ All pending matches are fully resolved! Good job admin!
                </div>
              ) : (
                matchesPending.map((match) => {
                  const teamA = teams.find(t => t.id === match.teamAId) || { name: match.teamAId, code: 'TMA', flagUrl: '' };
                  const teamB = teams.find(t => t.id === match.teamBId) || { name: match.teamBId, code: 'TMB', flagUrl: '' };

                  return (
                    <div
                      key={match.id}
                      className="bg-[#161c24] border border-solid border-[#3b4a3f]/30 rounded-xl p-5 flex flex-col md:flex-row items-center gap-5 hover:border-world-cup-green/50 transition-colors"
                    >
                      <div className="flex-grow flex justify-between items-center w-full">
                        {/* Team A stats details */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-solid border-[#3b4a3f]/50 bg-[#161c24] shrink-0">
                            <img src={teamA.flagUrl} alt={teamA.code} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-display text-lg text-white block leading-none antialiased">
                              {teamA.code}
                            </span>
                            <span className="font-label-caps text-[9px] text-[#b9cbbd] tracking-wider uppercase">
                              {teamA.name}
                            </span>
                          </div>
                        </div>

                        {/* Mid score board columns */}
                        <div className="flex flex-col items-center px-4 gap-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              value={pendingScores[match.id]?.goalsA ?? 0}
                              onChange={(e) => setPendingScores({
                                ...pendingScores,
                                [match.id]: { ...pendingScores[match.id], goalsA: parseInt(e.target.value) || 0, goalsB: pendingScores[match.id]?.goalsB ?? 0 }
                              })}
                              className="w-12 bg-[#0e141c] border border-solid border-[#3b4a3f]/50 rounded-lg py-1 px-2 text-center text-white font-mono font-bold focus:outline-none focus:border-world-cup-green text-xl"
                            />
                            <span className="font-display text-24px md:text-28px text-white leading-none">-</span>
                            <input
                              type="number"
                              min="0"
                              value={pendingScores[match.id]?.goalsB ?? 0}
                              onChange={(e) => setPendingScores({
                                ...pendingScores,
                                [match.id]: { ...pendingScores[match.id], goalsB: parseInt(e.target.value) || 0, goalsA: pendingScores[match.id]?.goalsA ?? 0 }
                              })}
                              className="w-12 bg-[#0e141c] border border-solid border-[#3b4a3f]/50 rounded-lg py-1 px-2 text-center text-white font-mono font-bold focus:outline-none focus:border-world-cup-green text-xl"
                            />
                          </div>
                          <span className="font-label-caps text-[10px] text-world-cup-green tracking-wider uppercase font-extrabold bg-[#00f59b]/10 px-2 py-0.5 rounded">
                            {match.stage}
                          </span>
                        </div>

                        {/* Team B stats details */}
                        <div className="flex items-center gap-3 flex-row-reverse text-right">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-solid border-[#3b4a3f]/50 bg-[#161c24] shrink-0">
                            <img src={teamB.flagUrl} alt={teamB.code} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="font-display text-lg text-white block leading-none antialiased">
                              {teamB.code}
                            </span>
                            <span className="font-label-caps text-[9px] text-[#b9cbbd] tracking-wider uppercase">
                              {teamB.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Side Actions indicators & Settle buttons */}
                      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 md:border-l border-solid border-[#3b4a3f]/30 md:pl-5 shrink-0">
                        <div className="flex flex-col gap-1 text-[11px] font-mono justify-center text-on-surface-variant min-w-[120px]">
                          {match.stats.map((stat: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 font-semibold text-world-cup-green">
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>{stat}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSettle(match)}
                          className="bg-world-cup-green text-[#0e141c] font-display uppercase tracking-wider py-2.5 px-6 rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm shrink-0 font-bold ml-auto cursor-pointer"
                        >
                          Settle
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 1.5: Settled Matches History */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden border-solid border-[#3b4a3f]/30">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="font-display text-xl text-white flex items-center gap-2 select-none">
                <CheckSquare className="w-5 h-5 text-world-cup-green" />
                Settled Matches History
              </h3>
              <span className="bg-[#2f353e] text-[#b9cbbd] font-label-caps text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                {matchesCompleted?.length || 0} Match{(matchesCompleted?.length || 0) !== 1 ? 'es' : ''} settled
              </span>
            </div>

            <div className="flex flex-col gap-3 relative z-10 max-h-[300px] overflow-y-auto pr-2">
              {!matchesCompleted || matchesCompleted.length === 0 ? (
                <div className="text-center py-6 rounded-lg bg-[#0e141c]/50 text-xs text-[#b9cbbd] font-medium">
                  No matches have been settled yet.
                </div>
              ) : (
                matchesCompleted.map((match) => {
                  const teamA = teams.find(t => t.id === match.teamAId) || { name: match.teamAId, code: 'TMA', flagUrl: '' };
                  const teamB = teams.find(t => t.id === match.teamBId) || { name: match.teamBId, code: 'TMB', flagUrl: '' };

                  return (
                    <div
                      key={match.id}
                      className="bg-[#161c24]/60 border border-solid border-[#3b4a3f]/20 rounded-xl p-3 flex items-center justify-between opacity-90"
                    >
                      <div className="flex items-center gap-3 w-1/3">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-solid border-[#3b4a3f]/50 bg-[#161c24] shrink-0">
                          <img src={teamA.flagUrl} alt={teamA.code} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-display text-base text-white">{teamA.code}</span>
                      </div>
                      <div className="flex flex-col items-center px-4 w-1/3">
                        <span className="font-display text-xl text-white leading-none">
                          {match.goalsA} - {match.goalsB}
                        </span>
                        <span className="font-label-caps text-[8px] text-world-cup-green mt-1 tracking-wider uppercase opacity-80 bg-world-cup-green/10 px-2 py-0.5 rounded">
                          {match.stage}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-row-reverse text-right w-1/3">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-solid border-[#3b4a3f]/50 bg-[#161c24] shrink-0">
                          <img src={teamB.flagUrl} alt={teamB.code} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-display text-base text-white">{teamB.code}</span>
                      </div>
                      <div className="flex justify-end w-12">
                        <button 
                          onClick={() => onRevertMatch(match.id)}
                          className="bg-error/10 hover:bg-error/30 text-error border border-error/50 rounded p-1.5 cursor-pointer transition-colors active:scale-95"
                          title="Revert Match"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: Manual match resolver override form */}
          <div className="glass-panel rounded-xl p-6 border-solid border-[#3b4a3f]/30 bg-[#161c24]/30">
            <h3 className="font-display text-xl text-white mb-5 flex items-center gap-2 select-none">
              🔩 Manual Match Override
            </h3>
            <form onSubmit={handleManualOverride} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Select Team A */}
              <div className="bg-[#1a2029] p-4 rounded-xl border border-solid border-[#3b4a3f]/20 shadow">
                <label className="block font-label-caps text-[10px] text-on-surface-variant mb-2 font-bold tracking-widest">
                  TEAM A (HOME)
                </label>
                <select
                  value={overrideTeamA}
                  onChange={(e) => setOverrideTeamA(e.target.value)}
                  className="w-full bg-[#0e141c] border border-solid border-[#3b4a3f]/30 rounded-xl py-2.5 px-3 text-xs md:text-sm text-white focus:outline-none"
                >
                  <option value="">Select Team A</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block font-label-caps text-[10px] text-on-surface-variant mb-1 font-bold tracking-widest">
                      GOALS
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={goalsA}
                      onChange={(e) => setGoalsA(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#0e141c] border border-solid border-[#3b4a3f]/30 rounded-xl py-2 px-3 text-center text-white font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <input
                      type="checkbox"
                      id="clean-sheet-a"
                      checked={cleanSheetA}
                      onChange={(e) => setCleanSheetA(e.target.checked)}
                      className="rounded bg-[#0e141c] border-solid border-[#3b4a3f]/40 text-world-cup-green focus:ring-world-cup-green"
                    />
                    <label htmlFor="clean-sheet-a" className="font-label-caps text-[10px] text-white font-bold cursor-pointer select-none">
                      CLEAN SHEET
                    </label>
                  </div>
                </div>
              </div>

              {/* Select Team B */}
              <div className="bg-[#1a2029] p-4 rounded-xl border border-solid border-[#3b4a3f]/20 shadow">
                <label className="block font-label-caps text-[10px] text-on-surface-variant mb-2 font-bold tracking-widest">
                  TEAM B (AWAY)
                </label>
                <select
                  value={overrideTeamB}
                  onChange={(e) => setOverrideTeamB(e.target.value)}
                  className="w-full bg-[#0e141c] border border-solid border-[#3b4a3f]/30 rounded-xl py-2.5 px-3 text-xs md:text-sm text-white focus:outline-none"
                >
                  <option value="">Select Team B</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block font-label-caps text-[10px] text-on-surface-variant mb-1 font-bold tracking-widest">
                      GOALS
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={goalsB}
                      onChange={(e) => setGoalsB(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#0e141c] border border-solid border-[#3b4a3f]/30 rounded-xl py-2 px-3 text-center text-white font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <input
                      type="checkbox"
                      id="clean-sheet-b"
                      checked={cleanSheetB}
                      onChange={(e) => setCleanSheetB(e.target.checked)}
                      className="rounded bg-[#0e141c] border-solid border-[#3b4a3f]/40 text-world-cup-green focus:ring-world-cup-green"
                    />
                    <label htmlFor="clean-sheet-b" className="font-label-caps text-[10px] text-white font-bold cursor-pointer select-none">
                      CLEAN SHEET
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom properties toggles & resolution button */}
              <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between bg-[#1a2029]/80 p-4 rounded-xl border border-solid border-[#3b4a3f]/20 gap-4">
                <div className="flex items-center gap-6 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="went-elimination"
                      checked={wentToElimination}
                      onChange={(e) => setWentToElimination(e.target.checked)}
                      className="rounded bg-[#070b12] border-solid border-error/50 text-error focus:ring-error"
                    />
                    <label htmlFor="went-elimination" className="font-label-caps font-bold text-error cursor-pointer select-none">
                      ELIMINATION MATCH
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="went-penalties"
                      checked={wentToPenalties}
                      onChange={(e) => setWentToPenalties(e.target.checked)}
                      className="rounded bg-[#070b12] border-solid border-[#3b4a3f] text-world-cup-green focus:ring-world-cup-green"
                    />
                    <label htmlFor="went-penalties" className="font-label-caps font-bold cursor-pointer select-none">
                      WENT TO PENALTIES
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#0e141c] border border-solid border-[#3b4a3f] hover:border-world-cup-green text-white hover:text-world-cup-green font-display uppercase tracking-widest text-[12px] py-2.5 px-8 rounded-lg cursor-pointer font-bold select-none active:scale-95 transition-all shadow shadow-black/40"
                >
                  Force Settle Match
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (Col span 4) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Section 1: Manual liquidation bankruptcy tool */}
          <div className="glass-panel rounded-xl p-5 border-solid border-error/40 relative overflow-hidden bg-[#93000a]/5">
            <div className="absolute inset-0 bg-gradient-to-b from-[#93000a]/10 to-transparent pointer-events-none"></div>
            <h3 className="font-display text-xl text-error mb-4 flex items-center gap-2 select-none font-semibold">
              <AlertTriangle className="w-5 h-5 text-error" /> Team Bankruptcy
            </h3>
            
            <div className="flex gap-2 relative z-10">
              <select
                value={bankruptTeamId}
                onChange={(e) => setBankruptTeamId(e.target.value)}
                className="flex-grow bg-[#0e141c] border border-solid border-[#93000a]/30 rounded-xl py-2 px-3 text-xs md:text-sm text-white focus:outline-none"
              >
                <option value="">Select Eliminated Team</option>
                {teams.filter(t => t.price > 0).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </select>
              <button
                onClick={handleLiquidation}
                className="bg-error hover:bg-[#93000a] text-white font-display text-[12px] uppercase py-2 px-4 rounded-xl cursor-pointer font-bold active:scale-95 transition-transform"
              >
                Liquidate
              </button>
            </div>
            
            <p className="text-[11px] text-[#b9cbbd]/80 mt-3 relative z-10 leading-relaxed font-sans font-medium">
              ⚠️ Warning: This action crashes the stock by <strong className="text-white">-75%</strong> instantly and freezes it permanently. Investors lose massive capital. Action is permanent.
            </p>
          </div>

          {/* Section 2: Settle match audits historical logging panel */}
          <div className="glass-panel rounded-xl flex flex-col h-[480px]">
            <div className="p-4 border-b border-solid border-[#3b4a3f]/30 flex justify-between items-center bg-[#1a2029]">
              <h3 className="font-display text-lg text-white flex items-center gap-2 select-none">
                <History className="w-4.5 h-4.5 text-on-surface-variant" />
                Audit Log
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border-l-4 border-solid ${log.borderColor} pl-3 py-0.5 select-text`}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-label-caps text-[10px] text-white font-extrabold tracking-wider uppercase select-all">
                      {log.source}
                    </span>
                    <span className="font-mono text-[9px] text-[#b9cbbd] antialiased font-semibold">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#b9cbbd] leading-relaxed antialiased font-sans font-medium">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-solid border-[#3b4a3f]/30 text-center bg-[#161c24]/40">
              <button className="font-label-caps text-xs text-world-cup-green hover:underline cursor-pointer font-bold">
                VIEW FULL SYSTEM LOG
              </button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
