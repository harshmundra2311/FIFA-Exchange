import { useState, useMemo, FormEvent } from 'react';
import { ChevronLeft, Landmark, DollarSign, RefreshCw, Star, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { Team, Holding, ViewType } from '../lib/types';
import { motion } from 'motion/react';

interface TeamDetailProps {
  teamId: string;
  teams: Team[];
  holdings: Holding[];
  cash: number;
  onBack: () => void;
  onTrade: (type: 'BUY' | 'SELL', teamId: string, shares: number, price: number) => void;
  matchesPending: import('../lib/types').MatchPending[];
}

export default function TeamDetail({
  teamId,
  teams,
  holdings,
  cash,
  onBack,
  onTrade,
  matchesPending
}: TeamDetailProps) {
  const team = useMemo(() => teams.find(t => t.id === teamId), [teams, teamId]);

  // If team is liquidated or unavailable, guard render safely
  if (!team) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-[#b9cbbd]">Stock details could not be found for {teamId}.</p>
        <button onClick={onBack} className="mt-4 text-world-cup-green underline">Go Back</button>
      </div>
    );
  }

  // Position stats
  const holding = useMemo(() => holdings.find(h => h.teamId === team.id), [holdings, team.id]);
  const sharesOwned = holding ? holding.shares : 0;
  const avgPurchasePrice = holding ? holding.avgPrice : 0;
  const positionValue = sharesOwned * team.price;
  const totalReturn = holding ? positionValue - (sharesOwned * avgPurchasePrice) : 0;

  // Form states
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [sharesInput, setSharesInput] = useState<number | ''>('');
  const [chartTimeline, setChartTimeline] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');

  // Sparkline coordinates based on historical parameters
  const chartPoints = useMemo(() => {
    // Return sample list of points according to size
    return team.history || [100, 105, 102, 110, 108, 115, 112, 118, 120, team.price];
  }, [team]);

  // Compute estimate summaries
  const sharesToTrade = typeof sharesInput === 'number' ? sharesInput : 0;
  const estimatedValue = sharesToTrade * team.price;
  const brokerFee = 0; // 0%
  const totalCost = tradeType === 'BUY' ? estimatedValue : estimatedValue;

  const canExecute = useMemo(() => {
    if (sharesToTrade <= 0) return false;
    if (team.isLocked) return false;
    if (tradeType === 'BUY') {
      return totalCost <= cash;
    } else {
      return sharesToTrade <= sharesOwned;
    }
  }, [sharesToTrade, tradeType, totalCost, cash, sharesOwned, team.isLocked]);

  const handleRatioClick = (pct: number) => {
    if (team.isLocked) return;
    if (tradeType === 'BUY') {
      // Buy max calculation
      const maxAffordable = Math.floor((cash) / (team.price * 1.01));
      if (maxAffordable <= 0) {
        setSharesInput('');
        return;
      }
      setSharesInput(Math.floor(maxAffordable * (pct / 100)));
    } else {
      // Sell max calculation
      if (sharesOwned <= 0) {
        setSharesInput('');
        return;
      }
      setSharesInput(Math.floor(sharesOwned * (pct / 100)));
    }
  };

  const handleConfirmTrade = (e: FormEvent) => {
    e.preventDefault();
    if (!canExecute || typeof sharesInput !== 'number') return;
    onTrade(tradeType, team.id, sharesInput, team.price);
    // Clear state
    setSharesInput('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      {/* Back navigation button */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-world-cup-green text-xs font-label-caps uppercase tracking-wider hover:underline hover:brightness-110 cursor-pointer font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Market</span>
        </button>
      </div>

      {/* Main Grid: Info columns left, brokerage widgets right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Columns (Col span 8) details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Team Flag, Group Metadata & Sparkline chart */}
          <div className="glass-panel rounded-xl p-6 relative overflow-hidden border-solid border-[#3b4a3f]/30 bg-[#161c24]/90">
            {team.isLocked && (
              <div className="absolute top-4 right-4 bg-trading-down/20 border border-solid border-trading-down text-trading-down text-[10px] font-label-caps uppercase px-3 py-1 rounded-full font-bold animate-pulse z-20">
                Match Live - Locked
              </div>
            )}

            {/* Title Header */}
            <div className="flex items-center justify-between border-b border-[#3b4a3f]/20 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#3b4a3f]/50 bg-[#161c24] shrink-0 shadow-lg">
                  <img src={team.flagUrl} alt={team.code} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-3xl text-white uppercase leading-none">
                    {team.name}
                  </h1>
                  <span className="font-label-caps text-xs text-[#b9cbbd] mt-1 block font-semibold">
                    {team.code} • {team.group} • {team.matchday}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-2xl font-extrabold text-world-cup-green tracking-tight">
                  {formatCurrency(team.price)}
                </div>
                <div className={`font-mono text-xs font-bold ${team.priceChange24h >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                  {team.priceChange24h >= 0 ? '+' : ''}{team.priceChange24h.toFixed(1)}% (24h)
                </div>
              </div>
            </div>

            {/* Sparkline timeline details */}
            <div className="w-full h-44 relative bg-[#0e141c]/40 rounded-xl p-3 border border-solid border-[#3b4a3f]/10 mb-5 flex items-end">
              {/* Graphic sparkline overlay */}
              <svg className="w-full h-[80%] text-world-cup-green" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path
                  d={`M0,${100 - (chartPoints[0] || 50)} L10,${100 - (chartPoints[1] || 52)} L20,${100 - (chartPoints[2] || 48)} L30,${100 - (chartPoints[3] || 55)} L40,${100 - (chartPoints[4] || 53)} L50,${100 - (chartPoints[5] || 60)} L60,${100 - (chartPoints[6] || 58)} L70,${100 - (chartPoints[7] || 65)} L80,${100 - (chartPoints[8] || 63)} L90,${100 - (chartPoints[9] || 70)} M0,100 Z`}
                  fill="none"
                />
                
                {/* Genuine area render */}
                <path
                  d={`M0,${100 - ((chartPoints[0] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L10,${100 - ((chartPoints[1] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L20,${100 - ((chartPoints[2] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L30,${100 - ((chartPoints[3] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L40,${100 - ((chartPoints[4] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L50,${100 - ((chartPoints[5] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L60,${100 - ((chartPoints[6] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L70,${100 - ((chartPoints[7] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L80,${100 - ((chartPoints[8] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L90,${100 - ((chartPoints[9] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L100,100 L0,100 Z`}
                  fill="url(#team-detail-grad)"
                  opacity="0.1"
                />
                <path
                  d={`M0,${100 - ((chartPoints[0] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L10,${100 - ((chartPoints[1] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L20,${100 - ((chartPoints[2] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L30,${100 - ((chartPoints[3] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L40,${100 - ((chartPoints[4] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L50,${100 - ((chartPoints[5] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L60,${100 - ((chartPoints[6] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L70,${100 - ((chartPoints[7] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L80,${100 - ((chartPoints[8] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)} 
                     L90,${100 - ((chartPoints[9] - Math.min(...chartPoints)) / (Math.max(...chartPoints) - Math.min(...chartPoints)) * 70 + 15)}`}
                  fill="none"
                  stroke="#00F59B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="team-detail-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00F59B" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Highlight selector bubble in sparkline */}
              <div className="absolute top-[30%] left-[80%] w-3 h-3 bg-world-cup-green rounded-full border-2 border-solid border-[#0e141c] outline outline-world-cup-green/50 outline-5 cursor-pointer"></div>
            </div>

          </div>

          {/* Section 2: Performance Metrics Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stats list card */}
            <div className="bg-[#1a2029]/60 border border-solid border-[#3b4a3f]/30 rounded-xl p-5 shadow">
              <h3 className="font-display text-lg text-white mb-4 uppercase tracking-tight select-none">
                Performance Metrics
              </h3>
              
              <div className="space-y-3 font-semibold text-xs text-white">
                <div className="flex justify-between items-center p-2.5 bg-[#161c24] rounded-lg border border-[#3b4a3f]/10">
                  <span className="text-on-surface-variant font-medium">Goals Scored</span>
                  <span className="font-mono">{team.stats.goalsScored} <strong className="text-trading-up ml-1.5">(+{formatCurrency(team.stats.goalsScored * 20)})</strong></span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#161c24] rounded-lg border border-[#3b4a3f]/10">
                  <span className="text-on-surface-variant font-medium">Goals Conceded</span>
                  <span className="font-mono">{team.stats.goalsConceded} <strong className="text-trading-down ml-1.5">(-{formatCurrency(team.stats.goalsConceded * 10)})</strong></span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#161c24] rounded-lg border border-[#3b4a3f]/10">
                  <span className="text-on-surface-variant font-medium">Clean Sheets</span>
                  <span className="font-mono">{team.stats.cleanSheets} <strong className="text-trading-up ml-1.5">(+{formatCurrency(team.stats.cleanSheets * 50)})</strong></span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#161c24] rounded-lg border border-[#3b4a3f]/10">
                  <span className="text-on-surface-variant font-medium">Win / Draw / Loss</span>
                  <span className="font-mono">{team.stats.winDrawLoss} <strong className="text-trading-up ml-1.5">(+Bonus)</strong></span>
                </div>
              </div>
            </div>

            {/* Fixture details listing */}
            <div className="bg-[#1a2029]/60 border border-solid border-[#3b4a3f]/30 rounded-xl p-5 shadow">
              <h3 className="font-display text-lg text-white mb-4 uppercase tracking-tight select-none">
                Recent Fixtures
              </h3>
              
              <div className="space-y-2.5 font-semibold text-xs text-white">
                {matchesPending.filter(m => m.teamAId === team.id || m.teamBId === team.id).map(match => {
                  const opponentId = match.teamAId === team.id ? match.teamBId : match.teamAId;
                  const opponent = teams.find(t => t.id === opponentId)?.name || opponentId;
                  const kickoffStr = match.kickoffTime 
                    ? new Date(match.kickoffTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'TBD';
                  return (
                    <div key={match.id} className="flex justify-between items-center p-2 bg-[#161c24] rounded-lg border border-world-cup-green/20 px-3">
                      <div>
                        <span className="font-mono text-world-cup-green text-[10px] uppercase font-bold mr-2">
                          Upcoming
                        </span>
                        <span className="font-sans font-bold">vs {opponent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#b9cbbd]">
                          {kickoffStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {team.fixtures.map((fixture: any, idx: number) => {
                  let badgeStyles = 'bg-white/5 border-white/10 text-on-surface-variant';
                  if (fixture.score.includes('(W)')) badgeStyles = 'bg-trading-up/10 border-trading-up/20 text-trading-up';
                  else if (fixture.score.includes('(L)')) badgeStyles = 'bg-trading-down/10 border-trading-down/20 text-trading-down';

                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-[#161c24] rounded-lg border border-[#3b4a3f]/10 px-3"
                    >
                      <div>
                        <span className="font-mono text-world-cup-green text-[10px] uppercase font-bold mr-2">
                          {fixture.stage}
                        </span>
                        <span className="font-sans font-bold">vs {fixture.opponent}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${badgeStyles}`}>
                          {fixture.score}
                        </span>
                        {fixture.profit !== 0 && (
                          <span className={`font-mono text-[10px] ${fixture.profit > 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                            {fixture.profit > 0 ? '+' : ''}
                            {formatCurrency(fixture.profit)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Right Brokerage Trade Widget Column (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Position details widget */}
          <div className="bg-[#1a2029] border border-solid border-[#3b4a3f]/30 rounded-xl p-5 shadow relative overflow-hidden">
            <h3 className="font-display text-lg uppercase mb-4 text-white">
              Your Position
            </h3>
            
            {sharesOwned === 0 ? (
              <p className="text-xs text-[#b9cbbd] antialiased leading-relaxed">
                You do not currently own any stock in this team. Enter a quantity in the trade brokerage broker panel below to start.
              </p>
            ) : (
              <div className="space-y-3 font-semibold text-xs text-white font-mono antialiased">
                <div className="flex justify-between">
                  <span className="font-sans text-[#b9cbbd] font-normal">Shares Owned</span>
                  <span>{sharesOwned} shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-[#b9cbbd] font-normal">Total Position Value</span>
                  <span className="text-world-cup-green">{formatCurrency(positionValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-[#b9cbbd] font-normal">Average Cost Basis</span>
                  <span>{formatCurrency(avgPurchasePrice)}</span>
                </div>
                <div className="flex justify-between border-t border-solid border-[#3b4a3f]/20 pt-2.5 mt-2 select-all">
                  <span className="font-sans text-[#b9cbbd] font-normal">Total Returns</span>
                  <span className={totalReturn >= 0 ? 'text-trading-up' : 'text-trading-down'}>
                    {totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Broker trade panel */}
          <div className="glass-panel border-solid border-[#3b4a3f]/40 p-5 rounded-xl flex flex-col gap-4 relative">
            <h3 className="font-display text-lg tracking-tight uppercase text-white select-none">
              Trade Stock Broker
            </h3>

            {/* Buy / Sell toggle switches */}
            <div className="grid grid-cols-2 bg-[#0e141c] p-1 rounded-xl border border-solid border-[#3b4a3f]/25 select-none font-label-caps text-xs">
              <button
                onClick={() => setTradeType('BUY')}
                disabled={team.isLocked}
                className={`py-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  tradeType === 'BUY'
                    ? 'bg-[#00F59B] text-black shadow-lg shadow-[#00F59B]/20'
                    : 'text-[#b9cbbd] hover:text-white'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                disabled={team.isLocked}
                className={`py-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
                  tradeType === 'SELL'
                    ? 'bg-[#FF3D00] text-white shadow-lg shadow-[#FF3D00]/20'
                    : 'text-[#b9cbbd] hover:text-white'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Locked Match Alerts */}
            {team.isLocked && (
              <div className="p-3 bg-trading-down/15 rounded-xl border border-solid border-trading-down/30 text-trading-down text-center select-none flex items-center justify-center gap-1.5 font-semibold text-xs leading-none">
                <span className="block w-2 h-2 rounded-full bg-trading-down animate-ping"></span>
                <span>MATCH LIVE - TRADING SUSPENDED</span>
              </div>
            )}

            {/* Shares input form */}
            <form onSubmit={handleConfirmTrade} className="space-y-4">
              <div>
                <label className="block text-[11px] font-label-caps text-on-surface-variant font-bold tracking-widest uppercase mb-1.5">
                  NUMBER OF SHARES
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    disabled={team.isLocked}
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    placeholder="Enter shares amount"
                    className="w-full bg-[#161c24] border border-solid border-[#3b4a3f]/30 rounded-xl py-3 px-4 font-mono font-bold text-white text-sm focus:outline-none focus:border-world-cup-green placeholder:text-on-surface-variant/30 text-end"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-bold text-[#b9cbbd] select-none text-xs">
                    QTY
                  </div>
                </div>
              </div>

              {/* Fractional selector shortcut pins */}
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] select-none">
                {[25, 50, 75, 100].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    disabled={team.isLocked}
                    onClick={() => handleRatioClick(pct)}
                    className="py-1.5 rounded-lg border border-solid border-[#3b4a3f]/30 hover:border-world-cup-green/50 text-[#b9cbbd] hover:text-world-cup-green transition-all bg-[#1a2029] font-bold cursor-pointer"
                  >
                    {pct === 100 ? 'MAX' : `${pct}%`}
                  </button>
                ))}
              </div>

              {/* Estimate receipt items list */}
              <div className="space-y-2 border-t border-solid border-[#3b4a3f]/20 pt-4 font-mono text-xs text-[#b9cbbd] antialiased">
                <div className="flex justify-between">
                  <span className="font-sans font-normal">Broker Price</span>
                  <span className="text-white font-extrabold">{formatCurrency(team.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans font-normal">Estimated Value</span>
                  <span className="text-white font-extrabold">{formatCurrency(estimatedValue)}</span>
                </div>
                
                <div className="flex justify-between border-t border-solid border-[#3b4a3f]/30 pt-3 mt-1 underline decoration-dashed text-sm font-semibold text-white select-all">
                  <span className="font-sans">Total {tradeType === 'BUY' ? 'Cost' : 'Credit'}</span>
                  <span className="font-bold text-world-cup-green">{formatCurrency(totalCost)}</span>
                </div>
              </div>

              {/* Broking actions confirmation button */}
              <button
                type="submit"
                disabled={!canExecute || team.isLocked}
                className={`w-full py-3.5 rounded-xl font-display uppercase font-bold tracking-widest text-[12px] transition-all select-none shadow cursor-pointer ${
                  canExecute && !team.isLocked
                    ? tradeType === 'BUY'
                      ? 'bg-[#00F59B] text-black hover:opacity-95 hover:shadow-lg hover:shadow-[#00F59B]/20'
                      : 'bg-[#FF3D00] text-white hover:opacity-95 hover:shadow-lg hover:shadow-[#FF3D00]/20'
                    : 'bg-[#2a362d] text-[#dde2ef] opacity-80 cursor-not-allowed border border-solid border-[#4a5c4f]'
                }`}
              >
                Confirm {tradeType}
              </button>

              {/* Error messages if cash / position is limited */}
              {tradeType === 'BUY' && totalCost > cash && sharesToTrade > 0 && (
                <p className="text-[10px] font-sans font-bold text-trading-down text-center leading-normal pl-4 select-none">
                  ❌ Insufficient cash portfolio bounds! Limit deposit is {formatCurrency(cash)}.
                </p>
              )}
              {tradeType === 'SELL' && sharesToTrade > sharesOwned && sharesToTrade > 0 && (
                <p className="text-[10px] font-sans font-bold text-trading-down text-center leading-normal pl-4 select-none">
                  ❌ Insufficient stock shares in deposit! Maximum available is {sharesOwned} shares.
                </p>
              )}

              {/* Cash Footer indicator */}
              <div className="text-center font-mono text-[10px] text-on-surface-variant flex items-center justify-center gap-1 select-none font-bold">
                <Landmark className="w-3.5 h-3.5 text-[#00f59b]" />
                <span>Broker Wallet Asset Cash Balance: {formatCurrency(cash)}</span>
              </div>
            </form>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
