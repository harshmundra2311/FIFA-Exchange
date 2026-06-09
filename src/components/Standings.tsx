"use client";

import React from 'react';
import { useGame } from '../lib/GameContext';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Standings() {
  const { teams } = useGame();
  const router = useRouter();

  const sortedTeams = [...teams].sort((a, b) => b.price - a.price);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white uppercase tracking-tighter mb-2">Global Standings</h1>
        <p className="text-[#b9cbbd] text-sm">All 48 World Cup stocks ranked from highest to lowest market value.</p>
      </div>

      <div className="bg-[#121820]/80 rounded-2xl border border-solid border-[#3b4a3f]/30 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161c24] border-b border-[#3b4a3f]/50">
                <th className="p-4 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest text-center w-16">Rank</th>
                <th className="p-4 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Team</th>
                <th className="p-4 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest text-center">Tier</th>
                <th className="p-4 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest text-right">Market Price</th>
                <th className="p-4 font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest text-right">24H Change</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => {
                const isPositive = team.priceChange24h >= 0;
                return (
                  <tr 
                    key={team.id} 
                    onClick={() => router.push(`/team/${team.id}`)}
                    className="border-b border-[#3b4a3f]/20 hover:bg-[#1a2029]/80 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 text-center">
                      <span className="font-mono text-lg font-bold text-white/50">{index + 1}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-solid border-[#3b4a3f]/35 flex items-center justify-center overflow-hidden bg-[#161c24] shrink-0">
                           <img src={team.flagUrl} alt={team.code} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-display text-base text-white leading-tight group-hover:text-world-cup-green transition-colors">{team.name}</div>
                          <div className="font-label-caps text-[10px] text-[#b9cbbd] tracking-wider">{team.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-surface-variant text-on-surface font-label-caps text-[9px] uppercase tracking-wider px-2 py-1 rounded">
                        Tier {team.tier}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono text-lg font-extrabold text-world-cup-green">
                        {formatCurrency(team.price)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className={`font-mono text-xs font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-trading-up' : 'text-[#FF3D00]'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{team.priceChange24h}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
