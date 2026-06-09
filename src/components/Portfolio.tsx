import { Wallet, Filter, ArrowUp, ArrowDown, PieChart, Plus } from 'lucide-react';
import { Team, Holding, Transaction, ViewType } from '../lib/types';
import { motion } from 'motion/react';

interface PortfolioProps {
  teams: Team[];
  holdings: Holding[];
  transactions: Transaction[];
  cash: number;
  portfolioValue: number;
  onViewChange: (view: ViewType) => void;
  onSelectTeam: (teamId: string) => void;
}

export default function Portfolio({
  teams,
  holdings,
  transactions,
  cash,
  portfolioValue,
  onViewChange,
  onSelectTeam
}: PortfolioProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' FC';
  };

  // Calculate detailed holding states
  const holdingsDetails = holdings
    .map(h => {
      const team = teams.find(t => t.id === h.teamId);
      if (!team) return null;
      const currentValue = h.shares * team.price;
      const totalCost = h.shares * h.avgPrice;
      const netProfit = currentValue - totalCost;
      const profitPct = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
      return {
        ...h,
        team,
        currentValue,
        netProfit,
        profitPct
      };
    })
    .filter((h): h is NonNullable<typeof h> => h !== null && h.shares > 0);

  // Calculate Tier Allocation percentages
  const totalStockValue = holdingsDetails.reduce((sum, h) => sum + h.currentValue, 0);

  const tierSums = { tier1: 0, tier2: 0, tier3: 0, tier4: 0 };
  holdingsDetails.forEach(h => {
    if (h.team.tier === 1) tierSums.tier1 += h.currentValue;
    else if (h.team.tier === 2) tierSums.tier2 += h.currentValue;
    else if (h.team.tier === 3) tierSums.tier3 += h.currentValue;
    else if (h.team.tier === 4) tierSums.tier4 += h.currentValue;
  });

  const allocation = {
    t1: totalStockValue > 0 ? (tierSums.tier1 / totalStockValue) * 100 : 45,
    t2: totalStockValue > 0 ? (tierSums.tier2 / totalStockValue) * 100 : 30,
    t3: totalStockValue > 0 ? (tierSums.tier3 / totalStockValue) * 100 : 15,
    t4: totalStockValue > 0 ? (tierSums.tier4 / totalStockValue) * 100 : 10
  };

  // Calculate Net Lifetime Returns
  const totalCostBasis = holdingsDetails.reduce((sum, h) => sum + h.shares * h.avgPrice, 0);
  const netProfitTotal = totalStockValue - totalCostBasis;
  const netReturnPctTotal = totalCostBasis > 0 ? (netProfitTotal / totalCostBasis) * 100 : 14.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* View Header */}
      <div>
        <h1 className="font-display text-4xl md:text-5xl text-on-surface uppercase tracking-tight select-none">
          Portfolio
        </h1>
        <p className="text-body-base text-on-surface-variant mt-1.5 font-medium">
          Manage your tournament holdings and track live investment growth.
        </p>
      </div>

      {/* Portfolio Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Value Metric */}
        <div className="bg-[#1a2029]/60 backdrop-blur-xl border border-solid border-[#3b4a3f]/30 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00F59B]/5 rounded-full blur-2xl group-hover:bg-[#00F59B]/10 transition-colors duration-500"></div>
          <span className="font-label-caps text-[11px] text-[#b9cbbd] uppercase tracking-widest block mb-2 font-bold">
            Total Asset Value
          </span>
          <div className="flex items-baseline gap-3 select-all">
            <span className="font-mono text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(portfolioValue)}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 font-mono text-xs">
            {netProfitTotal >= 0 ? (
              <span className="text-trading-up flex items-center gap-1">
                <ArrowUp className="w-4 h-4" />
                +{netReturnPctTotal.toFixed(1)}%
              </span>
            ) : (
              <span className="text-trading-down flex items-center gap-1">
                <ArrowDown className="w-4 h-4" />
                {netReturnPctTotal.toFixed(1)}%
              </span>
            )}
            <span className="text-on-surface-variant"> ({netProfitTotal >= 0 ? '+' : ''}{formatCurrency(netProfitTotal)}) lifetime</span>
          </div>
        </div>

        {/* Available Cash metric */}
        <div className="bg-[#1a2029]/60 backdrop-blur-xl border border-[#3b4a3f]/30 rounded-xl p-6 relative">
          <span className="font-label-caps text-[11px] text-[#b9cbbd] uppercase tracking-widest block mb-2 font-bold">
            Available Cash
          </span>
          <div className="flex items-baseline gap-3 font-mono">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {formatCurrency(cash)}
            </span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => onViewChange('market')}
              className="text-[#00F59B] hover:text-white transition-colors text-xs font-label-caps uppercase tracking-wider font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Buy Team Stocks</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier Allocation Metric progress scale bar */}
        <div className="bg-[#1a2029]/60 backdrop-blur-xl border border-[#3b4a3f]/30 rounded-xl p-6 flex flex-col justify-center">
          <span className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest block mb-3.5 font-bold">
            Tier Asset Allocation
          </span>
          
          {/* Segment Progress allocation bar */}
          <div className="h-3.5 w-full rounded-full bg-[#0e141c] flex overflow-hidden border border-solid border-[#3b4a3f]/20 mb-4 select-none">
            <div
              className="h-full bg-tier-1 transition-all duration-1000"
              style={{ width: `${allocation.t1}%` }}
              title={`Tier 1: ${allocation.t1.toFixed(0)}%`}
            ></div>
            <div
              className="h-full bg-tier-2 transition-all duration-1000"
              style={{ width: `${allocation.t2}%` }}
              title={`Tier 2: ${allocation.t2.toFixed(0)}%`}
            ></div>
            <div
              className="h-full bg-tier-3 transition-all duration-1000"
              style={{ width: `${allocation.t3}%` }}
              title={`Tier 3: ${allocation.t3.toFixed(0)}%`}
            ></div>
            <div
              className="h-full bg-tier-4 transition-all duration-1000"
              style={{ width: `${allocation.t4}%` }}
              title={`Tier 4: ${allocation.t4.toFixed(0)}%`}
            ></div>
          </div>

          {/* Allocation Legend Circle metrics */}
          <div className="flex justify-between items-center text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-tier-1"></div>
              <span className="text-[#b9cbbd]">T1 {allocation.t1.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-tier-2"></div>
              <span className="text-[#b9cbbd]">T2 {allocation.t2.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-tier-3"></div>
              <span className="text-[#b9cbbd]">T3 {allocation.t3.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-tier-4"></div>
              <span className="text-[#b9cbbd]">T4 {allocation.t4.toFixed(0)}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Holdings List block */}
      <div className="bg-[#161c24]/80 backdrop-blur-xl border border-solid border-[#3b4a3f]/30 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-solid border-[#3b4a3f]/30 flex justify-between items-center bg-[#1a2029]">
          <h2 className="font-display text-xl text-white uppercase tracking-tight">
            Current Holdings
          </h2>
          <button className="p-2 border border-solid border-[#3b4a3f]/50 rounded-lg text-on-surface-variant hover:text-world-cup-green transition-colors cursor-pointer flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {holdingsDetails.length === 0 ? (
            <div className="text-center py-20 text-[#b9cbbd] text-sm">
              Your portfolio is empty. Click the Quick Trade button in the sidebar or go to the Market Floor to buy team stocks!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a2029]/30 border-b border-solid border-[#3b4a3f]/30 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-widest">
                  <th className="p-4 pl-6 whitespace-nowrap">Team</th>
                  <th className="p-4 text-right whitespace-nowrap">Shares</th>
                  <th className="p-4 text-right whitespace-nowrap">Avg Price</th>
                  <th className="p-4 text-right whitespace-nowrap">Current</th>
                  <th className="p-4 text-right whitespace-nowrap">Total Value</th>
                  <th className="p-4 text-right pr-6 whitespace-nowrap">P/L</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm font-semibold text-white">
                {holdingsDetails.map((item) => {
                  const gainLossColor = item.netProfit >= 0 ? 'text-trading-up' : 'text-trading-down';
                  const gainLossBg = item.netProfit >= 0 ? 'bg-trading-up/10' : 'bg-trading-down/10';

                  return (
                    <tr
                      key={item.teamId}
                      onClick={() => onSelectTeam(item.teamId)}
                      className="border-b border-[#3b4a3f]/10 hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#161c24] border border-[#3b4a3f]/20 flex items-center justify-center overflow-hidden shrink-0 relative">
                            {item.team.isLocked && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                                <span className="text-[10px] text-world-cup-green animate-pulse">🔒</span>
                              </div>
                            )}
                            <img src={item.team.flagUrl} alt={item.team.code} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="block font-sans text-xs md:text-sm text-white font-bold group-hover:text-world-cup-green transition-colors">
                              {item.team.name}
                            </span>
                            <span className="font-label-caps text-[10px] text-tier-1 flex items-center gap-1 mt-0.5 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-tier-1"></span>
                              Tier {item.team.tier}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right text-white">{item.shares}</td>
                      <td className="p-4 text-right text-[#b9cbbd] font-normal">
                        {formatCurrency(item.avgPrice)}
                      </td>
                      <td className="p-4 text-right text-white">
                        {formatCurrency(item.team.price)}
                      </td>
                      <td className="p-4 text-right text-white font-bold">
                        {formatCurrency(item.currentValue)}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold ${gainLossColor}`}>
                            {item.netProfit >= 0 ? '+' : ''}
                            {formatCurrency(item.netProfit)}
                          </span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${gainLossBg} ${gainLossColor} mt-1 font-mono`}>
                            {item.netProfit >= 0 ? '+' : ''}
                            {item.profitPct.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent transactions log section */}
      <div className="bg-[#161c24]/80 backdrop-blur-xl border border-solid border-[#3b4a3f]/30 rounded-xl overflow-hidden shadow-lg">
        <div className="p-5 border-b border-solid border-[#3b4a3f]/30 bg-[#1a2029]">
          <h2 className="font-display text-xl text-white uppercase tracking-tight">
            Recent Transactions
          </h2>
        </div>
        
        <div className="p-0">
          {transactions.slice(0, 5).map((tx) => {
            const team = teams.find(t => t.id === tx.teamId);
            const teamName = team ? team.name : tx.teamId;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border-b border-solid border-[#3b4a3f]/10 hover:bg-white/5 transition-colors px-6"
              >
                <div className="flex items-center gap-4">
                  {tx.type === 'BUY' ? (
                    <div className="w-10 h-10 rounded-full bg-trading-up/10 border border-solid border-trading-up/20 flex items-center justify-center text-trading-up shrink-0">
                      <ArrowDown className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-trading-down/10 border border-solid border-trading-down/20 flex items-center justify-center text-trading-down shrink-0">
                      <ArrowUp className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="block text-xs md:text-sm text-white font-extrabold">
                      {tx.type} {teamName}
                    </span>
                    <span className="font-label-caps text-[9px] text-[#b9cbbd] tracking-widest uppercase">
                      {tx.timestamp}
                    </span>
                  </div>
                </div>
                
                <div className="text-right font-mono text-xs md:text-sm select-all">
                  <span className="block text-white font-bold">
                    {tx.shares} shares @ {formatCurrency(tx.price)}
                  </span>
                  <span className="text-on-surface-variant text-xs font-medium">
                    {tx.type === 'BUY' ? '-' : '+'}
                    {formatCurrency(tx.shares * tx.price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 text-center border-t border-solid border-[#3b4a3f]/30 bg-[#1a2029]/40">
          <button className="text-world-cup-green font-label-caps text-xs uppercase tracking-widest hover:underline cursor-pointer font-bold">
            View All History
          </button>
        </div>
      </div>
    </motion.div>
  );
}
