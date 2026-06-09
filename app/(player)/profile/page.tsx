"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGame } from '@/src/lib/GameContext';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { rank, transactions, createdAt, teams } = useGame();

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="animate-fadeIn animate-duration-300">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white uppercase tracking-tight mb-2 flex items-center gap-3">
          Trader Profile
        </h1>
        <p className="text-on-surface-variant text-sm max-w-2xl">
          Manage your account details and trading identity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center border-[#3b4a3f]/30">
            <div className="relative mb-6">
              <img
                alt={`${(session?.user as any)?.fullName || session?.user?.name || 'Trader'} avatar`}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.15)] bg-[#090e17]"
                src={(session?.user as any)?.avatarSeed?.includes('/')
                  ? (session?.user as any)?.avatarSeed
                  : `https://api.dicebear.com/7.x/avataaars/svg?seed=${(session?.user as any)?.avatarSeed}&backgroundColor=00F59B`
                }
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#FFD700] rounded-full text-black flex items-center justify-center border-2 border-[#161c24] font-bold text-lg shadow-lg">
                ★
              </div>
            </div>
            
            <h2 className="text-2xl font-display text-white uppercase tracking-wide mb-1">
              {(session?.user as any)?.fullName || session?.user?.name || 'Trader'}
            </h2>
            <p className="font-mono text-[#00F59B] text-sm mb-4">@{session?.user?.name || 'trader'}</p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1a2029] border border-[#3b4a3f] text-xs font-label-caps tracking-wider text-[#b9cbbd] mb-6">
              Rank #{rank || '--'}
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-error/10 text-error hover:bg-error hover:text-white border border-error/30 py-3 rounded-lg font-label-caps uppercase tracking-widest text-xs transition-all font-bold"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl border-[#3b4a3f]/30">
            <h3 className="font-label-caps text-[#b9cbbd] text-xs uppercase tracking-widest mb-4">
              Account Overview
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[#3b4a3f]/20">
                <span className="text-on-surface-variant text-sm">Account Status</span>
                <span className="text-[#00F59B] bg-[#00F59B]/10 px-2 py-1 rounded text-xs font-label-caps font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#3b4a3f]/20">
                <span className="text-on-surface-variant text-sm">Market Cycle</span>
                <span className="text-white font-mono text-sm">{teams && teams.length > 0 ? teams[0].matchday : 'Matchday 1'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#3b4a3f]/20">
                <span className="text-on-surface-variant text-sm">Total Trades</span>
                <span className="text-white font-mono text-sm">{transactions ? transactions.length : 0}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-on-surface-variant text-sm">Join Date</span>
                <span className="text-white font-mono text-sm">
                  {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '--'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border-[#3b4a3f]/30">
            <h3 className="font-label-caps text-[#b9cbbd] text-xs uppercase tracking-widest mb-4">
              Security Settings
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Password and advanced security options will be available in Module 2.
            </p>
            <button disabled className="bg-[#1a2029] text-[#b9cbbd] py-2 px-4 rounded-lg font-label-caps uppercase text-[10px] tracking-wider opacity-50 cursor-not-allowed">
              Change Password (Locked)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
