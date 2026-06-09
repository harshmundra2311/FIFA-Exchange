"use client";

import { Trophy, Medal, Star, ShieldAlert } from 'lucide-react';
import { LeaderboardEntry } from '../lib/types';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  portfolioValue: number;
  rank?: number;
}

export default function Leaderboard({ entries, portfolioValue, rank: userRank }: LeaderboardProps) {
  // The backend now provides live, fully sorted entries with precise ranks and values.
  const processedEntries = entries;

  // Extract top 3 for podium
  const first = processedEntries.find(e => e.rank === 1) || processedEntries[0];
  const second = processedEntries.find(e => e.rank === 2) || processedEntries[1];
  const third = processedEntries.find(e => e.rank === 3) || processedEntries[2];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  const [lastUpdated, setLastUpdated] = useState('');
  
  useEffect(() => {
    const updateTime = () => setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header section */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-world-cup-green uppercase select-none">
            Leaderboard
          </h1>
        </div>
        <div className="text-right hidden sm:block">
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            Last Updated
          </p>
          <p className="font-mono text-xs text-world-cup-green mt-1 font-semibold flex items-center justify-end gap-1">
            <span className="w-2 h-2 bg-world-cup-green rounded-full animate-ping inline-block"></span>
            LIVE - {lastUpdated || 'Loading...'}
          </p>
        </div>
      </header>

      {/* Ranks 1, 2, 3 Podium Illustration */}
      <section className="grid grid-cols-3 gap-3 md:gap-6 mb-12 items-end pt-12">
        
        {/* Silver Rank 2 */}
        {second && (
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel rounded-xl p-4 flex flex-col items-center relative h-[190px] md:h-[210px] justify-end border-t-4 border-solid border-[#C0C0C0] bg-[#1a2029]/80"
          >
            <div className="absolute -top-6 w-12 h-12 rounded-full bg-[#C0C0C0] flex items-center justify-center font-display text-20px text-black shadow-lg shadow-[#C0C0C0]/35 border-4 border-solid border-[#0e141c]">
              2
            </div>
            <img
              alt={second.traderName}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full mb-3 border-2 border-solid border-[#C0C0C0] object-cover bg-[#090e17]"
              src={second.avatarUrl}
            />
            <span className="font-label-caps text-xs text-white truncate w-full text-center">
              {second.traderName}
            </span>
            <span className="font-mono text-xs md:text-sm text-world-cup-green mt-1.5 font-bold">
              {formatCurrency(second.value)}
            </span>
          </motion.div>
        )}

        {/* Gold Rank 1 (Tallest podium section with glow elements) */}
        {first && (
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel rounded-xl p-4 flex flex-col items-center relative h-[230px] md:h-[250px] justify-end border-t-4 border-solid border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.15)] bg-[#1a2029]"
          >
            <div className="absolute -top-8 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FFD700] flex items-center justify-center font-display text-24px text-black shadow-xl shadow-[#FFD700]/40 border-4 border-solid border-[#0e141c]">
              1
            </div>
            <img
              alt={first.traderName}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full mb-3 border-2 border-solid border-[#FFD700] object-cover bg-[#090e17]"
              src={first.avatarUrl}
            />
            <span className="font-label-caps text-sm text-white truncate w-full text-center font-bold">
              {first.traderName}
            </span>
            <span className="font-mono text-sm md:text-base text-world-cup-green mt-1.5 font-extrabold select-all">
              {formatCurrency(first.value)}
            </span>
          </motion.div>
        )}

        {/* Bronze Rank 3 */}
        {third && (
          <motion.div 
            whileHover={{ y: -4 }}
            className="glass-panel rounded-xl p-4 flex flex-col items-center relative h-[170px] md:h-[190px] justify-end border-t-4 border-solid border-[#CD7F32] bg-[#1a2029]/80"
          >
            <div className="absolute -top-5 w-10 h-10 rounded-full bg-[#CD7F32] flex items-center justify-center font-display text-16px text-black shadow-lg shadow-[#CD7F32]/35 border-4 border-solid border-[#0e141c]">
              3
            </div>
            <img
              alt={third.traderName}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full mb-3 border-2 border-solid border-[#CD7F32] object-cover bg-[#090e17]"
              src={third.avatarUrl}
            />
            <span className="font-label-caps text-xs text-white truncate w-full text-center">
              {third.traderName}
            </span>
            <span className="font-mono text-xs md:text-sm text-world-cup-green mt-1.5 font-bold">
              {formatCurrency(third.value)}
            </span>
          </motion.div>
        )}
      </section>

      {/* Rankings Listing Table */}
      <section className="glass-panel rounded-xl overflow-hidden shadow-2xl border-solid border-[#3b4a3f]/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-solid border-[#3b4a3f]/30 bg-[#161c24]/50">
                <th className="p-4 pl-6 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-center w-16">
                  Rank
                </th>
                <th className="p-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
                  Trader
                </th>
                <th className="p-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-right">
                  Value
                </th>
                <th className="p-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-right hidden sm:table-cell">
                  Return
                </th>
                <th className="p-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest text-center hidden md:table-cell">
                  Holdings
                </th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm font-semibold select-none">
              {processedEntries.map((trader) => {
                const isUser = trader.isCurrentUser;
                
                return (
                  <tr
                    key={trader.traderName}
                    className={`border-b border-solid border-[#3b4a3f]/10 transition-colors ${
                      isUser
                        ? 'bg-[#00f59b]/10 hover:bg-[#00f59b]/15 text-world-cup-green border-l-4 border-l-world-cup-green'
                        : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-4 px-2 text-center text-xs md:text-sm font-extrabold max-w-[60px]">
                      {trader.rank}
                    </td>

                    {/* Trader Avatar & Username */}
                    <td className="p-4 font-sans">
                      <div className="flex items-center gap-3">
                        <img
                          alt={trader.traderName}
                          className={`w-8 h-8 rounded-full object-cover shrink-0 ${
                            isUser ? 'border border-world-cup-green' : 'border border-white/20'
                          }`}
                          src={trader.avatarUrl}
                        />
                        <span className={`text-xs md:text-sm ${isUser ? 'font-extrabold text-world-cup-green' : 'font-bold'}`}>
                          {trader.traderName} {isUser && '(You)'}
                        </span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="p-4 text-right">
                      {formatCurrency(trader.value)}
                    </td>

                    {/* Return pct */}
                    <td className="p-4 text-right text-trading-up hidden sm:table-cell font-bold">
                      +{trader.returnPct.toFixed(1)}%
                    </td>

                    {/* Holdings count */}
                    <td className="p-4 text-center hidden md:table-cell text-on-surface-variant font-medium">
                      {trader.holdings}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load more rankings button */}
        <div className="p-4 text-center border-t border-solid border-[#3b4a3f]/20 bg-[#161c24]/30">
          <button className="font-label-caps text-xs text-world-cup-green hover:text-white transition-colors uppercase tracking-widest font-extrabold cursor-pointer">
            Load More Rankings
          </button>
        </div>
      </section>
    </motion.div>
  );
}
