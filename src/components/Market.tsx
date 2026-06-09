import { useState } from 'react';
import { Search, Lock, Info, ArrowUpRight, ArrowDownRight, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { Team } from '../lib/types';
import { motion } from 'motion/react';

interface MarketProps {
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
  onSettleMatchDirect?: () => void;
}

export default function Market({ teams, onSelectTeam }: MarketProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [showMechanics, setShowMechanics] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  // Filter teams based on search query and selected Tier
  const filteredTeams = teams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = selectedTier === 'all' ? true : team.tier === selectedTier;
    
    return matchesSearch && matchesTier;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl text-on-surface uppercase select-none leading-none">
            Market Floor
          </h1>
          <p className="text-body-base text-on-surface-variant mt-2 font-medium">
            Live stock trading prices based on tournament match performances.
          </p>
        </div>

        {/* Search & Tier Selection Filters */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
          {/* Search Input field */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4.5 h-4.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams..."
              className="w-full bg-[#1a2029] border border-solid border-[#3b4a3f]/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-world-cup-green focus:outline-none placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="flex gap-2 font-label-caps text-[11px] uppercase tracking-wider">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-4 py-2 bg-[#1a2029] border border-solid rounded-xl transition-all font-semibold cursor-pointer ${
                selectedTier === 'all'
                  ? 'border-world-cup-green text-world-cup-green shadow bg-[#00f59b]/5'
                  : 'border-[#3b4a3f]/30 text-on-surface-variant hover:text-white'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setSelectedTier(1)}
              className={`px-4 py-2 bg-[#1a2029] border border-solid rounded-xl transition-all font-semibold cursor-pointer ${
                selectedTier === 1
                  ? 'border-tier-1 text-tier-1 bg-[#FFD700]/5'
                  : 'border-[#3b4a3f]/30 text-tier-1/80 hover:text-tier-1'
              }`}
            >
              T1 (Elite)
            </button>
            <button
              onClick={() => setSelectedTier(2)}
              className={`px-4 py-2 bg-[#1a2029] border border-solid rounded-xl transition-all font-semibold cursor-pointer ${
                selectedTier === 2
                  ? 'border-tier-2 text-tier-2 bg-[#E5E4E2]/5'
                  : 'border-[#3b4a3f]/30 text-tier-2/80 hover:text-tier-2'
              }`}
            >
              T2 (Challenger)
            </button>
          </div>
        </div>
      </div>

      {/* Legend Information Box (Stadium Rules) */}
      <div className="bg-[#1a2029]/60 backdrop-blur-xl border border-solid border-[#3b4a3f]/30 rounded-xl overflow-hidden transition-all duration-300">
        <div 
          className="p-4 flex flex-wrap gap-5 items-center justify-between cursor-pointer hover:bg-[#1a2029]"
          onClick={() => setShowMechanics(!showMechanics)}
        >
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Info className="w-4 h-4 text-world-cup-green" />
            <span className="font-label-caps text-base uppercase tracking-wider font-extrabold text-white flex items-center gap-2">
              PRICE MECHANICS
              {showMechanics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-trading-down font-semibold">
            <Lock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Live Match Locks Trading</span>
          </div>
        </div>

        {/* Expanded Rules Section */}
        {showMechanics && (
          <div className="p-6 border-t border-[#3b4a3f]/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm bg-[#0e141c]/40 animate-fadeIn animate-duration-200">
            {/* Match Results */}
            <div>
              <h4 className="font-label-caps text-[#00F59B] text-[10px] uppercase tracking-widest mb-3 border-b border-[#00F59B]/20 pb-1.5 flex items-center gap-2">
                <span className="bg-[#00F59B]/20 text-[#00F59B] px-1.5 rounded">1</span> Match Results
              </h4>
              <ul className="space-y-2.5 text-[#b9cbbd]">
                <li className="flex justify-between items-center"><span className="text-xs">Tier 1 Win</span><span className="text-[#00F59B] font-mono text-xs font-bold">+150 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Tier 2 Win</span><span className="text-[#00F59B] font-mono text-xs font-bold">+250 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Tier 3 Win</span><span className="text-[#00F59B] font-mono text-xs font-bold">+350 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Tier 4 Win</span><span className="text-[#00F59B] font-mono text-xs font-bold">+500 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Draw (Groups)</span><span className="text-[#00F59B] font-mono text-xs font-bold">+100 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Loss (Groups)</span><span className="text-[#FF3D00] font-mono text-xs font-bold">-250 FC</span></li>
              </ul>
            </div>

            {/* In-Match Events */}
            <div>
              <h4 className="font-label-caps text-[#00F59B] text-[10px] uppercase tracking-widest mb-3 border-b border-[#00F59B]/20 pb-1.5 flex items-center gap-2">
                <span className="bg-[#00F59B]/20 text-[#00F59B] px-1.5 rounded">2</span> In-Match Events
              </h4>
              <ul className="space-y-2.5 text-[#b9cbbd]">
                <li className="flex justify-between items-center"><span className="text-xs">Goal Scored</span><span className="text-[#00F59B] font-mono text-xs font-bold">+20 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Goal Conceded</span><span className="text-[#FF3D00] font-mono text-xs font-bold">-20 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs">Clean Sheet</span><span className="text-[#00F59B] font-mono text-xs font-bold">+50 FC</span></li>
              </ul>
            </div>

            {/* Tournament Progression */}
            <div>
              <h4 className="font-label-caps text-[#00F59B] text-[10px] uppercase tracking-widest mb-3 border-b border-[#00F59B]/20 pb-1.5 flex items-center gap-2">
                <span className="bg-[#00F59B]/20 text-[#00F59B] px-1.5 rounded">3</span> Knockouts
              </h4>
              <ul className="space-y-2.5 text-[#b9cbbd]">
                <li className="flex justify-between items-center"><span className="text-xs">Advance to Finals</span><span className="text-[#00F59B] font-mono text-xs font-bold">+300 FC</span></li>
                <li className="flex justify-between items-center"><span className="text-xs text-[#FFD700] font-bold">World Champion</span><span className="text-[#FFD700] font-mono text-xs font-extrabold">+500 FC</span></li>
              </ul>
            </div>

            {/* Tournament Elimination */}
            <div>
              <h4 className="font-label-caps text-[#FF3D00] text-[10px] uppercase tracking-widest mb-3 border-b border-[#FF3D00]/20 pb-1.5 flex items-center gap-2">
                <span className="bg-[#FF3D00]/10 text-[#FF3D00] px-1.5 rounded">4</span> Elimination
              </h4>
              <div className="bg-[#FF3D00]/5 border border-[#FF3D00]/20 p-5 rounded-xl text-center">
                <span className="text-[#FF3D00] font-extrabold font-label-caps tracking-widest block mb-2 text-lg">Bankrupt</span>
                <span className="text-[#b9cbbd] text-xs leading-relaxed">
                  If a team is eliminated, its price suffers a <span className="text-[#FF3D00] font-mono font-bold">-75% crash</span> and all held shares are auto-liquidated.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeams.map((team) => {
          // Tier color tags
          const badgeStyles =
            team.tier === 1
              ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-black font-extrabold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
              : team.tier === 2
              ? 'bg-gradient-to-r from-[#E5E4E2] to-[#A9A9A9] text-black font-bold'
              : team.tier === 3
              ? 'bg-gradient-to-r from-[#CD7F32] to-[#8B4513] text-white font-semibold'
              : 'bg-gradient-to-r from-[#607D8B] to-[#37474F] text-white font-medium';

          return (
            <div
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className={`glass-panel rounded-xl p-5 relative overflow-hidden group cursor-pointer transition-all duration-300 border border-solid ${
                team.isLocked ? 'border-trading-down/30 bg-[#0e141c]/40' : 'border-[#3b4a3f]/30 hover:border-world-cup-green/50'
              }`}
            >
              {/* Match Live Locked Overlay display */}
              {team.isLocked && (
                <div className="absolute inset-0 bg-[#0a0e14]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center select-none rounded-xl">
                  <Lock className="w-8 h-8 text-[#FF3D00] mb-2 animate-pulse drop-shadow-[0_0_8px_rgba(255,61,0,0.5)]" />
                  <span className="font-label-caps text-[11px] text-[#FF3D00] uppercase tracking-widest bg-[#FF3D00]/10 px-3 py-1.5 rounded-lg border border-solid border-[#FF3D00]/40 font-extrabold shadow-[0_0_15px_rgba(255,61,0,0.15)]">
                    Match Live - Locked
                  </span>
                </div>
              )}

              {/* Card Title Block */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  {/* Flag container */}
                  <div className="w-10 h-10 rounded-full border border-solid border-[#3b4a3f]/35 flex items-center justify-center overflow-hidden bg-[#161c24] shrink-0">
                    <img src={team.flagUrl} alt={team.code} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-white m-0 leading-none group-hover:text-world-cup-green transition-colors">
                      {team.name}
                    </h3>
                    <span className="font-label-caps text-[11px] text-[#b9cbbd] tracking-wide font-medium">
                      {team.code}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full font-label-caps text-[9px] uppercase tracking-wider ${badgeStyles}`}>
                  Tier {team.tier}
                </span>
              </div>

              {/* Price Details */}
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-mono text-xl text-world-cup-green font-extrabold tracking-tight">
                    {formatCurrency(team.price)}
                  </div>
                  <div
                    className={`font-mono text-xs font-semibold flex items-center gap-0.5 mt-1 ${
                      team.priceChange24h >= 0 ? 'text-trading-up' : 'text-trading-down'
                    }`}
                  >
                    {team.priceChange24h >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>
                      {team.priceChange24h >= 0 ? '+' : ''}
                      {team.priceChange24h.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Vertical Histobar Sparkline Columns */}
                <div className="w-20 h-10 flex items-end justify-between font-mono shrink-0 select-none opacity-85 group-hover:opacity-105 transition-opacity">
                  <div
                    className={`w-1.5 rounded-t-sm h-6 ${team.priceChange24h >= 0 ? 'bg-trading-up/60' : 'bg-trading-down/60'}`}
                  ></div>
                  <div
                    className={`w-1.5 rounded-t-sm h-8 ${team.priceChange24h >= 0 ? 'bg-trading-up/80' : 'bg-trading-down/80'}`}
                  ></div>
                  <div
                    className={`w-1.5 rounded-t-sm h-5 ${team.priceChange24h >= 0 ? 'bg-trading-up/70' : 'bg-trading-down/70'}`}
                  ></div>
                  <div
                    className={`w-1.5 rounded-t-sm h-10 ${team.priceChange24h >= 0 ? 'bg-trading-up shadow-glow-up' : 'bg-trading-down shadow-glow-down'}`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="py-24 text-center rounded-xl border border-dashed border-[#3b4a3f]/30">
          <p className="text-lg text-[#b9cbbd] font-semibold">No tournament teams match your query.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTier('all'); }}
            className="mt-4 text-world-cup-green font-label-caps text-xs uppercase tracking-widest hover:underline font-bold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </motion.div>
  );
}
