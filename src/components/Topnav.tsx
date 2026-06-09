import { Wallet, Bell, Menu, X, Landmark, TrendingUp, Briefcase, Trophy, Gavel, LayoutDashboard, ListOrdered, Calendar } from 'lucide-react';
import { ViewType } from '../lib/types';
import { useSession } from 'next-auth/react';

interface TopnavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  cash: number;
  portfolioValue: number;
  onAdminToggle: () => void;
  isAdminMode: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Topnav({
  currentView,
  onViewChange,
  cash,
  portfolioValue,
  onAdminToggle,
  isAdminMode,
  mobileMenuOpen,
  setMobileMenuOpen
}: TopnavProps) {
  const { data: session } = useSession();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-50 bg-[#0e141c]/90 backdrop-blur-xl border-b border-[#3b4a3f]/30 flex justify-between items-center px-6 lg:px-8 shadow-md">
        <div className="flex items-center gap-6">
          {/* Logo Name - Hidden on desktop since it's in the sidebar */}
          <div className="font-display text-lg text-world-cup-green uppercase tracking-tighter flex items-center gap-2 select-none lg:hidden">
            FIFA Exchange
            {isAdminMode && (
              <span className="bg-error text-[#690005] font-label-caps text-[9px] px-1.5 py-0.5 rounded ml-1 font-bold">
                ADMIN
              </span>
            )}
          </div>

          {/* Desktop/Tablet Nav Links */}
          <nav className="hidden md:flex gap-5 h-full items-center">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'text-world-cup-green border-b-2 border-world-cup-green pb-1 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('market')}
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer ${
                currentView === 'market' || currentView === 'detail'
                  ? 'text-world-cup-green border-b-2 border-world-cup-green pb-1 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              Market
            </button>
            <button
              onClick={() => onViewChange('portfolio')}
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer ${
                currentView === 'portfolio'
                  ? 'text-world-cup-green border-b-2 border-world-cup-green pb-1 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => onViewChange('leaderboard')}
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer ${
                currentView === 'leaderboard'
                  ? 'text-world-cup-green border-b-2 border-world-cup-green pb-1 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => onViewChange('standings')}
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer ${
                currentView === 'standings'
                  ? 'text-world-cup-green border-b-2 border-world-cup-green pb-1 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              Standings
            </button>
            <button
              onClick={() => onViewChange('schedule')}
              className={`font-label-caps text-[11px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer ${
                currentView === 'schedule'
                  ? 'text-world-cup-green border-b-2 border-world-cup-green pb-1 font-bold'
                  : 'text-on-surface-variant hover:text-on-surface font-semibold'
              }`}
            >
              Schedule
            </button>
          </nav>
        </div>

        {/* Dynamic Financial Panel (Top Right) */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Cash Display */}
          <div className="flex flex-col items-end justify-center">
            <span className="bg-[#00f59b]/15 text-world-cup-green text-xs font-mono font-extrabold px-3 py-1 rounded-full border border-solid border-world-cup-green/20">
              {formatCurrency(cash)}
            </span>
          </div>

          {/* Quick Icons */}
          <div className="flex items-center gap-1">
            <button className="text-world-cup-green hover:bg-white/5 p-1.5 rounded-full transition-all cursor-pointer relative" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full outline outline-2 outline-[#0e141c]"></span>
            </button>
          </div>

          {/* User Profile Avatar */}
          <div 
            onClick={() => onViewChange('profile')}
            className="w-9 h-9 rounded-full border border-solid border-[#00F59B] overflow-hidden cursor-pointer active:scale-95 transition-transform hover:brightness-110 shrink-0 bg-[#090e17]" 
            title="Profile"
          >
            <img 
              alt={`${(session?.user as any)?.fullName || session?.user?.name || 'Trader'} avatar`}
              className="w-full h-full object-cover"
              src={(session?.user as any)?.avatarSeed?.includes('/')
                ? (session?.user as any)?.avatarSeed
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${(session?.user as any)?.avatarSeed}&backgroundColor=00F59B`
              }
            />
          </div>

          {/* Mobile hamburger navigation icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-world-cup-green p-1.5 rounded bg-white/5 hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[#161c24]/95 border-b border-[#3b4a3f]/50 backdrop-blur-2xl flex flex-col p-4 space-y-2 animate-fadeIn animate-duration-150 shadow-2xl">
          <button
            onClick={() => { onViewChange('dashboard'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-xs ${
              currentView === 'dashboard' ? 'bg-[#00f59b]/15 text-world-cup-green' : 'text-on-surface-variant'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>DASHBOARD</span>
          </button>
          <button
            onClick={() => { onViewChange('market'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-xs ${
              currentView === 'market' || currentView === 'detail' ? 'bg-[#00f59b]/15 text-world-cup-green' : 'text-on-surface-variant'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>MARKET</span>
          </button>
          <button
            onClick={() => { onViewChange('portfolio'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-xs ${
              currentView === 'portfolio' ? 'bg-[#00f59b]/15 text-world-cup-green' : 'text-on-surface-variant'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>PORTFOLIO</span>
          </button>
          <button
            onClick={() => { onViewChange('leaderboard'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-xs ${
              currentView === 'leaderboard' ? 'bg-[#00f59b]/15 text-world-cup-green' : 'text-on-surface-variant'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>LEADERBOARD</span>
          </button>
          <button
            onClick={() => { onViewChange('standings'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-xs ${
              currentView === 'standings' ? 'bg-[#00f59b]/15 text-world-cup-green' : 'text-on-surface-variant'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>STANDINGS</span>
          </button>
          <button
            onClick={() => { onViewChange('schedule'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-label-caps text-xs ${
              currentView === 'schedule' ? 'bg-[#00f59b]/15 text-world-cup-green' : 'text-on-surface-variant'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>SCHEDULE</span>
          </button>

        </div>
      )}

      {/* Touch Bottom Navbar (Mobile Screen Constraint Indicator) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden h-16 bg-[#090e17]/95 border-t border-[#3b4a3f]/30 flex justify-around items-center backdrop-blur-lg px-2 pb-safe">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-label-caps text-[10px] leading-5 ${
            currentView === 'dashboard' ? 'text-world-cup-green font-bold' : 'text-on-surface-variant'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onViewChange('market')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-label-caps text-[10px] leading-5 ${
            currentView === 'market' || currentView === 'detail' ? 'text-world-cup-green font-bold' : 'text-on-surface-variant'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Market</span>
        </button>

        <button
          onClick={() => onViewChange('portfolio')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-label-caps text-[10px] leading-5 ${
            currentView === 'portfolio' ? 'text-world-cup-green font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span>Portfolio</span>
        </button>

        <button
          onClick={() => onViewChange('leaderboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full font-label-caps text-[10px] leading-5 ${
            currentView === 'leaderboard' ? 'text-world-cup-green font-bold' : 'text-on-surface-variant'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Rank</span>
        </button>
      </nav>
    </>
  );
}
