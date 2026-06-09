import { LayoutDashboard, TrendingUp, Briefcase, Trophy, Gavel, Settings, HelpCircle, ShieldAlert, ListOrdered, Calendar } from 'lucide-react';
import { ViewType } from '../lib/types';
import { useSession } from 'next-auth/react';
import { useGame } from '../lib/GameContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isAdminMode: boolean;
  onAdminModeToggle: () => void;
  cash: number;
  portfolioValue: number;
}

export default function Sidebar({
  currentView,
  onViewChange,
  isAdminMode,
  onAdminModeToggle,
  cash,
  portfolioValue
}: SidebarProps) {
  const { data: session } = useSession();
  const { rank, teams } = useGame();

  return (
    <aside className="fixed left-0 top-0 h-full hidden lg:flex flex-col p-6 z-40 w-64 border-r border-[#3b4a3f]/20 shadow-2xl bg-[#161c24]/95 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="mb-6 px-3">
        <div className="font-display text-24px text-world-cup-green uppercase tracking-tighter">
          FIFA Exchange
        </div>
        {isAdminMode ? (
          <span className="bg-error text-[#690005] font-label-caps text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mt-1.5 inline-block">
            ADMIN MODE
          </span>
        ) : (
          <span className="text-[#b9cbbd] text-xs font-medium tracking-wide">
            Live Market Cycle: {teams && teams.length > 0 ? teams[0].matchday : 'Matchday 1'}
          </span>
        )}
      </div>

      {/* User info card */}
      <div 
        onClick={() => onViewChange('profile')}
        className="flex items-center gap-3 mb-8 px-3 py-3 rounded-xl bg-[#1a2029]/80 border border-[#3b4a3f]/20 cursor-pointer hover:border-[#00F59B]/50 hover:bg-[#1a2029] transition-all group"
      >
        <div className="relative">
          <img
            alt={`${(session?.user as any)?.fullName || session?.user?.name || 'Trader'} avatar`}
            className="w-10 h-10 rounded-full object-cover border-2 border-[#FFD700] group-hover:scale-105 transition-transform bg-[#090e17]"
            src={(session?.user as any)?.avatarSeed?.includes('/') 
              ? (session?.user as any)?.avatarSeed 
              : ((session?.user as any)?.avatarSeed 
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${(session?.user as any)?.avatarSeed}&backgroundColor=00F59B` 
                : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100")}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#FFD700] rounded-full text-[9px] font-bold text-black flex items-center justify-center border border-[#161c24]">
            ★
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-label-caps text-[13px] text-on-surface truncate group-hover:text-white transition-colors">
            {(session?.user as any)?.fullName || session?.user?.name || 'Trader'}
          </div>
          <div className="text-[11px] text-[#b9cbbd] truncate group-hover:text-[#00F59B] transition-colors font-mono">
            Rank #{rank || '--'}
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 space-y-2">
        {/* Dashboard / Home */}
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label-caps text-[13px] uppercase ${
            currentView === 'dashboard'
              ? 'bg-[#00F59B]/15 text-[#00F59B] font-bold shadow-[inset_0_0_20px_rgba(0,245,155,0.05)] border border-[#00F59B]/30'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          <span>Dashboard</span>
        </button>

        {/* Market */}
        <button
          onClick={() => onViewChange('market')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label-caps text-[13px] uppercase ${
            currentView === 'market' || currentView === 'detail'
              ? 'bg-[#00F59B]/15 text-[#00F59B] font-bold shadow-[inset_0_0_20px_rgba(0,245,155,0.05)] border border-[#00F59B]/30'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <TrendingUp className="w-5 h-5 flex-shrink-0" />
          <span>Market Floor</span>
        </button>

        {/* Portfolio */}
        <button
          onClick={() => onViewChange('portfolio')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label-caps text-[13px] uppercase ${
            currentView === 'portfolio'
              ? 'bg-[#00F59B]/15 text-[#00F59B] font-bold shadow-[inset_0_0_20px_rgba(0,245,155,0.05)] border border-[#00F59B]/30'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Briefcase className="w-5 h-5 flex-shrink-0" />
          <span>Portfolio</span>
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => onViewChange('leaderboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label-caps text-[13px] uppercase ${
            currentView === 'leaderboard'
              ? 'bg-[#00F59B]/15 text-[#00F59B] font-bold shadow-[inset_0_0_20px_rgba(0,245,155,0.05)] border border-[#00F59B]/30'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Trophy className="w-5 h-5 flex-shrink-0" />
          <span>Leaderboard</span>
        </button>

        {/* Standings */}
        <button
          onClick={() => onViewChange('standings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label-caps text-[13px] uppercase ${
            currentView === 'standings'
              ? 'bg-[#00F59B]/15 text-[#00F59B] font-bold shadow-[inset_0_0_20px_rgba(0,245,155,0.05)] border border-[#00F59B]/30'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ListOrdered className="w-5 h-5 flex-shrink-0" />
          <span>Standings</span>
        </button>

        {/* Schedule */}
        <button
          onClick={() => onViewChange('schedule')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-label-caps text-[13px] uppercase ${
            currentView === 'schedule'
              ? 'bg-[#00F59B]/15 text-[#00F59B] font-bold shadow-[inset_0_0_20px_rgba(0,245,155,0.05)] border border-[#00F59B]/30'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <span>Schedule</span>
        </button>

      </nav>

      {/* Button Action */}
      <div className="mt-auto space-y-4 pt-4 border-t border-[#3b4a3f]/20">
        <button
          onClick={() => onViewChange('market')}
          className="w-full bg-[#00F59B] text-[#0e141c] py-3 rounded-lg font-display uppercase tracking-wider text-sm hover:opacity-95 transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-[#00F59B]/20"
        >
          ⚡ Quick Trade
        </button>


      </div>
    </aside>
  );
}
