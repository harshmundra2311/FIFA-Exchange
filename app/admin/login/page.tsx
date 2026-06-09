"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode) {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#dde2ef] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,61,0,0.05)_0%,rgba(9,9,11,1)_70%)]" />
      
      <div className="bg-[#18181b]/80 backdrop-blur-xl border border-trading-down/30 w-full max-w-md p-8 rounded-2xl relative z-10 shadow-[0_0_40px_rgba(255,61,0,0.1)]">
        <div className="flex flex-col items-center text-center mb-8">
          <Shield className="w-12 h-12 text-trading-down mb-4" />
          <h1 className="font-display text-3xl text-white uppercase tracking-tight mb-2">
            System Admin
          </h1>
          <p className="text-trading-down/80 text-sm font-mono tracking-widest">RESTRICTED ACCESS ONLY</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-label-caps text-xs text-on-surface-variant uppercase tracking-widest mb-2">
              Root Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-black/50 border border-trading-down/50 rounded-lg px-4 py-3 text-white font-mono focus:border-trading-down focus:outline-none transition-colors"
              placeholder="••••••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-trading-down text-white font-display uppercase tracking-widest py-3 rounded-lg hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(255,61,0,0.3)]"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-xs font-mono text-on-surface-variant hover:text-white transition-colors">
            RETURN TO PUBLIC PORTAL
          </Link>
        </div>
      </div>
    </div>
  );
}
