"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { registerUser, validateInviteCode, getAvailableAvatars } from '@/src/actions/auth';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [inviteCode, setInviteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Step 2 state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState('');
  const [availableAvatars, setAvailableAvatars] = useState<{name: string, avatarUrl: string}[]>([]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode) {
      setIsLoading(true);
      setErrorMsg('');
      const res = await validateInviteCode(inviteCode);
      setIsLoading(false);
      
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success) {
        const avatars = await getAvailableAvatars();
        setAvailableAvatars(avatars);
        if (avatars.length > 0) {
          const randomIdx = Math.floor(Math.random() * avatars.length);
          setAvatarSeed(avatars[randomIdx].avatarUrl);
        } else {
          // Fallback if somehow all 50 are taken
          setAvatarSeed(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}&backgroundColor=00F59B`);
        }
        setStep(2);
        setErrorMsg('');
      }
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && username && password) {
      setIsLoading(true);
      setErrorMsg('');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('avatarSeed', avatarSeed);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('inviteCode', inviteCode);
      
      const res = await registerUser(formData);
      setIsLoading(false);
      
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0e141c] text-[#dde2ef] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,245,155,0.05)_0%,rgba(14,20,28,1)_70%)]" />
      
      <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10 border-[#00F59B]/20">
        
        {isSuccess ? (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-24 h-24 text-[#00F59B] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(0,245,155,0.5)]" />
            <h1 className="font-display text-3xl text-white uppercase tracking-tight mb-4">
              Registration Successful!
            </h1>
            <p className="text-[#00F59B] font-mono text-sm animate-pulse">Redirecting to login...</p>
          </div>
        ) : step === 1 ? (
          <>
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl text-white uppercase tracking-tight mb-2">
                Register
              </h1>
              <p className="text-on-surface-variant font-medium">Enter your Invite Code to create an account.</p>
              {errorMsg && <p className="text-error mt-4 text-sm bg-error/10 py-2 rounded border border-error/20">{errorMsg}</p>}
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <label className="block font-label-caps text-xs text-[#b9cbbd] uppercase tracking-widest mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full bg-[#090e17] border border-[#3b4a3f]/50 rounded-lg px-4 py-3 text-white font-mono focus:border-[#00F59B] focus:outline-none transition-colors"
                  placeholder="e.g. BETA-X792"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00F59B] text-[#0e141c] font-display uppercase tracking-widest py-3 rounded-lg hover:bg-[#00E676] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Validating..." : "Validate Code"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link href="/login" className="text-[#00F59B] hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl text-white uppercase tracking-tight mb-2">
                Setup Profile
              </h1>
              <p className="text-on-surface-variant font-medium text-sm">Valid invite! Let's get your trader alias ready.</p>
              {errorMsg && <p className="text-error mt-4 text-sm bg-error/10 py-2 rounded border border-error/20">{errorMsg}</p>}
            </div>

            <form onSubmit={handleProfileSetup} className="space-y-5">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative mb-3">
                  <img 
                    src={avatarSeed.startsWith('http') ? avatarSeed : (avatarSeed.startsWith('/') ? avatarSeed : `/${avatarSeed}`)} 
                    alt="Assigned Avatar" 
                    className="w-24 h-24 rounded-full border-2 border-[#00F59B] shadow-[0_0_15px_rgba(0,245,155,0.3)] bg-[#090e17] object-cover"
                  />
                  <div className="absolute -bottom-2 right-0 bg-[#1a2029] border border-[#3b4a3f] text-[10px] px-2 py-0.5 rounded-full text-[#b9cbbd] font-label-caps tracking-wider">
                    Assigned
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (availableAvatars.length > 0) {
                      const randomIdx = Math.floor(Math.random() * availableAvatars.length);
                      setAvatarSeed(availableAvatars[randomIdx].avatarUrl);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#b9cbbd] hover:text-[#00F59B] transition-colors bg-[#1a2029] border border-[#3b4a3f]/50 px-3 py-1.5 rounded-full"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Shuffle Avatar
                </button>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#b9cbbd] uppercase tracking-widest mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#090e17] border border-[#3b4a3f]/50 rounded-lg px-4 py-2.5 text-white focus:border-[#00F59B] focus:outline-none transition-colors"
                  placeholder="e.g. Satoshi Nakamoto"
                  required
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#b9cbbd] uppercase tracking-widest mb-1.5">Username (Alias)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#3b4a3f]/50 bg-[#1a2029] text-[#b9cbbd] text-sm font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-[#090e17] border border-[#3b4a3f]/50 rounded-r-lg px-4 py-2.5 text-white font-mono focus:border-[#00F59B] focus:outline-none transition-colors"
                    placeholder="satoshi_99"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-[#b9cbbd] uppercase tracking-widest mb-1.5">Secure Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#090e17] border border-[#3b4a3f]/50 rounded-lg px-4 py-2.5 text-white focus:border-[#00F59B] focus:outline-none transition-colors pr-10"
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
                disabled={isLoading}
                className="w-full bg-[#00F59B] text-[#0e141c] font-display uppercase tracking-widest py-3 rounded-lg hover:bg-[#00E676] transition-colors font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
