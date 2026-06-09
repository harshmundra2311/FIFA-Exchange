"use client";

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading' || status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
    return <div className="min-h-screen bg-[#0e141c] flex items-center justify-center text-white">Authenticating...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0e141c] text-[#dde2ef] font-sans">
      <nav className="w-full h-16 bg-[#1a2332] border-b border-[#2d3748] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-500" />
          <span className="font-bold text-lg tracking-wide text-white">SYSTEM ADMIN</span>
        </div>
        <Link href="/" className="px-4 py-2 bg-[#2d3748] rounded text-sm font-medium hover:bg-[#3a475e] transition-colors">
          Exit Admin Mode
        </Link>
      </nav>
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
