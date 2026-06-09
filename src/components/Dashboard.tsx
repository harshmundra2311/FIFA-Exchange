import React, { useState } from 'react';
import { Share2, Clock, Trophy, LineChart, TrendingUp, TrendingDown, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Team, Holding, ViewType } from '../lib/types';
import { motion } from 'motion/react';

interface DashboardProps {
  teams: Team[];
  holdings: Holding[];
  cash: number;
  portfolioValue: number;
  onViewChange: (view: ViewType) => void;
  onSelectTeam: (teamId: string) => void;
  changePercent24h: number;
  changeAmount24h: number;
  rank: number;
  sparklinePoints: number[];
  matchesPending: import('../lib/types').MatchPending[];
}

export default function Dashboard({
  teams,
  holdings,
  cash,
  portfolioValue,
  onViewChange,
  onSelectTeam,
  changePercent24h,
  changeAmount24h,
  rank,
  sparklinePoints,
  matchesPending
}: DashboardProps) {
  const [timeframe, setTimeframe] = useState('1D');
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  // Find corresponding team data for holdings
  const holdingsWithData = holdings
    .map(h => {
      const team = teams.find(t => t.id === h.teamId);
      if (!team) return null;
      const currentValue = h.shares * team.price;
      const totalCost = h.shares * h.avgPrice;
      const netReturn = currentValue - totalCost;
      const returnPct = totalCost > 0 ? (netReturn / totalCost) * 100 : 0;
      return {
        ...h,
        team,
        currentValue,
        netReturn,
        returnPct
      };
    })
    .filter((h): h is NonNullable<typeof h> => h !== null);

  // Get Top Gainers (teams sorted by price change descending)
  const topGainers = [...teams]
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-on-surface uppercase tracking-tight select-none">
            Overview
          </h1>
          <p className="text-body-base text-on-surface-variant mt-1.5 font-medium">
            Live Market Cycle: {teams && teams.length > 0 ? teams[0].matchday : 'Matchday 1'}
          </p>
        </div>

        {/* Global Rank Status Display Card */}
        <div className="glass-card rounded-xl p-4 flex items-center gap-4 border-solid border-[#3b4a3f]/30 bg-[#1a2029]">
          <div className="w-12 h-12 rounded-full border-2 border-gold-rank flex items-center justify-center bg-[#090e17] shadow-lg shadow-gold-rank/10">
            <Trophy className="w-6 h-6 text-gold-rank" />
          </div>
          <div>
            <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
              Global Rank
            </div>
            <div className="font-display text-24px text-white select-none">#{rank || '--'}</div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Large Bento Card: Portfolio value stats & chart sparkline */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group border-solid border-[#3b4a3f]/30">
          {/* Animated glow visual accent */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00F59B]/5 rounded-full blur-[90px] group-hover:bg-[#00F59B]/10 transition-all duration-500"></div>

          <div className="relative z-10 flex justify-between items-start mb-6">
            <div>
              <div className="font-label-caps text-xs text-on-surface-variant uppercase mb-2 tracking-widest">
                Total Portfolio Value
              </div>
              <div className="font-mono text-3xl md:text-4xl font-extrabold text-world-cup-green tracking-tight select-all">
                {formatCurrency(portfolioValue)}
              </div>
              <div className="flex items-center gap-3 mt-2 font-mono">
                {changePercent24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-trading-up" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-trading-down" />
                )}
                <span className={`text-sm font-semibold ${changePercent24h >= 0 ? 'text-trading-up' : 'text-trading-down'}`}>
                  {changePercent24h >= 0 ? '+' : ''}
                  {formatCurrency(changeAmount24h)}
                  {' '}({changePercent24h >= 0 ? '+' : ''}{changePercent24h.toFixed(1)}%)
                </span>
                <span className="text-xs text-on-surface-variant font-medium">All Time</span>
              </div>
            </div>

            {/* Cash Available Details */}
            <div className="text-right">
              <div className="font-label-caps text-xs text-on-surface-variant uppercase mb-1.5 tracking-widest">
                Available Cash
              </div>
              <div className="font-mono text-xl md:text-2xl font-bold text-white">
                {formatCurrency(cash)}
              </div>
            </div>
          </div>

          {/* Abstract SVG Sparkline Dashboard Chart Overlay */}
          <div className="w-full h-32 relative z-10 flex items-end mt-4">
            <div className="w-full h-full bg-gradient-to-t from-[#00F59B]/10 to-transparent relative border-b border-solid border-[#00F59B]/50 rounded-lg">
              <svg className="absolute bottom-0 w-full h-full text-world-cup-green" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Visual Area Fill below path */}
                <path
                  d={`M${sparklinePoints.map((val, i, arr) => {
                    const max = Math.max(...arr, 10000);
                    const min = Math.min(...arr, 10000);
                    const range = max - min || 1;
                    const x = arr.length > 1 ? (i / (arr.length - 1)) * 100 : 50;
                    const y = 100 - ((val - min) / range) * 80 - 10;
                    return `${x},${y}`;
                  }).join(' L')} L100,100 L0,100 Z`}
                  fill="url(#sparkline-grad)"
                  opacity="0.15"
                />
                {/* Stroke path */}
                <path
                  d={`M${sparklinePoints.map((val, i, arr) => {
                    const max = Math.max(...arr, 10000);
                    const min = Math.min(...arr, 10000);
                    const range = max - min || 1;
                    const x = arr.length > 1 ? (i / (arr.length - 1)) * 100 : 50;
                    const y = 100 - ((val - min) / range) * 80 - 10;
                    return `${x},${y}`;
                  }).join(' L')}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                <defs>
                  <linearGradient id="sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00F59B" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

        </div>

        {/* Top Gainers Bento Card Block */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col justify-between border-solid border-[#3b4a3f]/30 bg-[#161c24]/90">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-white uppercase tracking-tight">
              Top Gainers
            </h2>
            <LineChart className="w-5 h-5 text-on-surface-variant" />
          </div>

          <div className="flex flex-col gap-4 flex-grow justify-center">
            {topGainers.map((gainer, idx) => {
              // Map tiers to color styles
              const tierStyles = 
                gainer.tier === 1 ? 'bg-[#FFD700] text-black font-extrabold' :
                gainer.tier === 2 ? 'bg-[#E5E4E2] text-black font-bold' :
                'bg-[#CD7F32] text-white font-semibold';

              return (
                <div
                  key={gainer.id}
                  onClick={() => onSelectTeam(gainer.id)}
                  className="flex items-center justify-between p-3.5 bg-[#161c24] rounded-xl border border-solid border-[#3b4a3f]/20 hover:border-world-cup-green/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded font-display text-[15px] flex items-center justify-center transition-transform group-hover:scale-105 ${tierStyles}`}>
                      {gainer.code}
                    </div>
                    <div>
                      <div className="font-label-caps text-xs text-white group-hover:text-world-cup-green transition-colors">
                        {gainer.name}
                      </div>
                      <div className="text-[11px] text-[#b9cbbd] font-sans">
                        Tier {gainer.tier} • {gainer.group}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-white font-bold">
                      {formatCurrency(gainer.price)}
                    </div>
                    <div className="font-mono text-xs text-trading-up font-semibold flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{gainer.priceChange24h.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current holdings list table */}
        <div className="md:col-span-8 glass-card rounded-xl p-6 border-solid border-[#3b4a3f]/30">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-white uppercase tracking-tight">
              Current Holdings
            </h2>
            <button
              onClick={() => onViewChange('portfolio')}
              className="text-world-cup-green font-label-caps text-xs uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {holdingsWithData.length === 0 ? (
              <div className="py-12 text-center text-[#b9cbbd]">
                No current stock holdings. Visit the Market Floor to make your first trade!
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-solid border-[#3b4a3f]/30">
                    <th className="py-2.5 pb-3 px-2 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
                      Team
                    </th>
                    <th className="py-2.5 pb-3 px-2 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-center">
                      Shares
                    </th>
                    <th className="py-2.5 pb-3 px-2 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-right">
                      Avg Price
                    </th>
                    <th className="py-2.5 pb-3 px-2 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-right">
                      Current
                    </th>
                    <th className="py-2.5 pb-3 px-2 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-right">
                      Return
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm font-semibold text-white">
                  {holdingsWithData.slice(0, 3).map((item, idx) => {
                    const returnColor = item.netReturn >= 0 ? 'text-trading-up' : 'text-trading-down';
                    
                    return (
                      <tr
                        key={item.teamId}
                        onClick={() => onSelectTeam(item.team.id)}
                        className="border-b border-[#3b4a3f]/10 hover:bg-white/5 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full border border-solid border-[#3b4a3f]/35 flex items-center justify-center overflow-hidden bg-[#161c24] shrink-0 group-hover:scale-110 transition-transform">
                              <img src={item.team.flagUrl} alt={item.team.code} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-sans text-xs md:text-sm text-white font-bold group-hover:text-world-cup-green transition-colors">
                                {item.team.name}
                              </span>
                              <span className="block text-[10px] text-[#b9cbbd] font-sans antialiased uppercase">
                                {item.team.code} • Tier {item.team.tier}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-center text-white">{item.shares}</td>
                        <td className="py-3.5 px-2 text-right text-[#b9cbbd]">
                          {formatCurrency(item.avgPrice)}
                        </td>
                        <td className="py-3.5 px-2 text-right text-white">
                          {formatCurrency(item.team.price)}
                        </td>
                        <td className={`py-3.5 px-2 text-right font-extrabold ${returnColor}`}>
                          {item.netReturn >= 0 ? '+' : ''}
                          {formatCurrency(item.netReturn)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Market Lockout Countdown alerts */}
        <div className="md:col-span-4 glass-card rounded-xl p-6 relative overflow-hidden border-solid border-trading-down/30 bg-[#161c24]/90">
          {/* Lockout pulse red ambient lighting anchor */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-trading-down/5 rounded-full blur-2xl animate-pulse"></div>

          <div className="flex items-center gap-2 mb-4 relative z-10 text-trading-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trading-down opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-trading-down"></span>
            </span>
            <span className="font-display text-lg text-white uppercase select-none font-medium">
              Market Lockouts
            </span>
          </div>
          
          <p className="text-xs text-[#b9cbbd] antialiased mb-5 relative z-10 font-medium">
            Trading locks 15 mins before kickoffs. Protect your liquidity.
          </p>

          <div className="flex flex-col gap-3 relative z-10">
            {matchesPending.length === 0 ? (
              <div className="text-center text-[#b9cbbd] py-6 text-sm">
                No upcoming matches. Market is fully liquid.
              </div>
            ) : (
              matchesPending.slice(0, 3).map((match, idx) => {
                const teamA = teams.find(t => t.id === match.teamAId);
                const teamB = teams.find(t => t.id === match.teamBId);
                if (!teamA || !teamB) return null;

                let countdownStr = "SOON";
                let isUrgent = false;
                if (match.kickoffTime) {
                  const kickoff = new Date(match.kickoffTime);
                  const now = new Date();
                  const diffMs = kickoff.getTime() - now.getTime();
                  if (diffMs > 0) {
                    const hours = Math.floor(diffMs / 3600000);
                    const mins = Math.floor((diffMs % 3600000) / 60000);
                    if (hours > 0) {
                      countdownStr = `IN ${hours}H ${mins}M`;
                    } else {
                      countdownStr = `IN ${mins} MINUTES`;
                      isUrgent = true;
                    }
                  } else {
                    countdownStr = "MATCH STARTED";
                    isUrgent = true;
                  }
                } else if (idx === 0) {
                  isUrgent = true;
                }

                return (
                  <div key={match.id} className={`bg-[#1a2029] border border-solid rounded-xl p-3.5 flex justify-between items-center transition-colors ${isUrgent ? 'border-trading-down/30 hover:border-trading-down/60' : 'border-[#3b4a3f]/30 opacity-80'}`}>
                    <div>
                      <div className={`font-label-caps text-[10px] mb-1 flex items-center gap-1.5 font-bold tracking-widest ${isUrgent ? 'text-trading-down' : 'text-on-surface-variant'}`}>
                        {isUrgent && <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />}
                        {countdownStr}
                      </div>
                      <div className="text-sm font-sans font-extrabold text-white">
                        {teamA.code} vs {teamB.code}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectTeam(teamA.id)}
                        className={`border border-solid text-[10px] font-label-caps uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${isUrgent ? 'border-trading-down/50 text-trading-down hover:bg-trading-down hover:text-[#0e141c]' : 'border-white/20 text-[#b9cbbd] hover:text-world-cup-green hover:border-world-cup-green'}`}
                      >
                        {teamA.code}
                      </button>
                      <button
                        onClick={() => onSelectTeam(teamB.id)}
                        className={`border border-solid text-[10px] font-label-caps uppercase font-bold tracking-wider px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${isUrgent ? 'border-trading-down/50 text-trading-down hover:bg-trading-down hover:text-[#0e141c]' : 'border-white/20 text-[#b9cbbd] hover:text-world-cup-green hover:border-world-cup-green'}`}
                      >
                        {teamB.code}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
