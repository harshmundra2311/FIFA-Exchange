import React from 'react';
import { Calendar, Clock } from 'lucide-react';

import prisma from '@/src/lib/prisma';

export default async function Schedule() {
  const dbMatches = await prisma.match.findMany({
    orderBy: { kickoffTime: 'asc' }
  });
  const teams = await prisma.team.findMany();
  const teamMap = new Map(teams.map(t => [t.id, t]));

  const grouped: Record<string, any[]> = {};
  dbMatches.forEach((m: any) => {
    if (!m.kickoffTime) return;
    const dateStr = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(m.kickoffTime);
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(m.kickoffTime) + ' IST';

    const teamA = teamMap.get(m.teamAId);
    const teamB = teamMap.get(m.teamBId);

    if (!grouped[dateStr]) grouped[dateStr] = [];
    grouped[dateStr].push({
      time: timeStr,
      teamA: teamA?.name,
      codeA: teamA?.code,
      flagA: teamA?.flagUrl,
      teamB: teamB?.name,
      codeB: teamB?.code,
      flagB: teamB?.flagUrl,
      group: teamA?.groupName || 'Group Stage',
      status: m.status
    });
  });

  const SCHEDULE = Object.keys(grouped).map(date => ({
    date,
    matches: grouped[date]
  }));
  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-world-cup-green" />
            Tournament Schedule
          </h1>
          <p className="text-[#b9cbbd] text-sm">Official FIFA World Cup 2026 match schedule.</p>
        </div>
        <div className="bg-[#121820] border border-[#3b4a3f]/30 px-4 py-2 rounded-lg flex items-center gap-2 w-fit">
          <Clock className="w-4 h-4 text-world-cup-green" />
          <span className="font-label-caps text-xs text-white uppercase tracking-wider">All times in IST (UTC+5:30)</span>
        </div>
      </div>

      <div className="space-y-8">
        {SCHEDULE.map((day, dayIndex) => (
          <div key={dayIndex} className="relative pl-4 md:pl-0">
            {/* Timeline connector for mobile */}
            <div className="absolute left-0 top-2 bottom-0 w-px bg-[#3b4a3f]/50 md:hidden"></div>
            
            <h3 className="font-display text-xl text-world-cup-green uppercase tracking-wide mb-4 relative flex items-center gap-2">
              <span className="absolute -left-5 w-2 h-2 rounded-full bg-world-cup-green md:hidden"></span>
              {day.date}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {day.matches.map((match, matchIndex) => (
                <div key={matchIndex} className="bg-[#121820]/80 border border-[#3b4a3f]/30 rounded-xl p-5 hover:border-[#00F59B]/30 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">{match.group}</span>
                    <span className="font-mono text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 px-2 py-1 rounded border border-[#FFD700]/20">
                      {match.time}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center relative">
                    {/* Team A */}
                    <div className="flex flex-col items-center gap-2 w-[40%]">
                      <div className="w-10 h-10 rounded-full border border-solid border-[#3b4a3f]/35 flex items-center justify-center bg-[#161c24] overflow-hidden shrink-0">
                        {match.flagA ? (
                          <img src={match.flagA} alt={match.codeA} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-white/70">{match.codeA}</span>
                        )}
                      </div>
                      <span className="font-display text-sm text-white text-center leading-tight">{match.teamA}</span>
                    </div>

                    {/* VS */}
                    <div className="font-label-caps text-[10px] text-on-surface-variant italic">VS</div>

                    {/* Team B */}
                    <div className="flex flex-col items-center gap-2 w-[40%]">
                      <div className="w-10 h-10 rounded-full border border-solid border-[#3b4a3f]/35 flex items-center justify-center bg-[#161c24] overflow-hidden shrink-0">
                        {match.flagB ? (
                          <img src={match.flagB} alt={match.codeB} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-white/70">{match.codeB}</span>
                        )}
                      </div>
                      <span className="font-display text-sm text-white text-center leading-tight">{match.teamB}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center border-t border-[#3b4a3f]/20 pt-8">
        <p className="text-sm text-on-surface-variant italic">Full 104-match schedule will populate closer to the tournament.</p>
      </div>
    </div>
  );
}
