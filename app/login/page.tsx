"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsLoading(true);
      setErrorMsg('');
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      setIsLoading(false);
      
      if (res?.error) {
        setErrorMsg('Invalid username or password');
      } else {
        router.push('/');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0e141c] text-[#dde2ef] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,245,155,0.05)_0%,rgba(14,20,28,1)_70%)]" />
      
      <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10 border-[#00F59B]/20">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl text-white uppercase tracking-tight mb-2">
            FIFA Exchange
          </h1>
          <p className="text-on-surface-variant font-medium">Welcome back. Enter your credentials.</p>
          {errorMsg && <p className="text-error mt-4 text-sm bg-error/10 py-2 rounded border border-error/20">{errorMsg}</p>}
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-label-caps text-xs text-[#b9cbbd] uppercase tracking-widest mb-2">
              Username
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#3b4a3f]/50 bg-[#1a2029] text-[#b9cbbd] text-sm font-mono">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full bg-[#090e17] border border-[#3b4a3f]/50 rounded-r-lg px-4 py-3 text-white font-mono focus:border-[#00F59B] focus:outline-none transition-colors"
                placeholder="satoshi_99"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-label-caps text-xs text-[#b9cbbd] uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#090e17] border border-[#3b4a3f]/50 rounded-lg px-4 py-3 text-white font-mono focus:border-[#00F59B] focus:outline-none transition-colors pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9cbbd] hover:text-[#00F59B] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00F59B] text-[#0e141c] font-display uppercase tracking-widest py-3 rounded-lg hover:bg-[#00E676] transition-colors font-bold"
          >
            Access Terminal
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#00F59B] hover:underline">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
