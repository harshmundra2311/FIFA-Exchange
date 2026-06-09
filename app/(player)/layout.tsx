"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/src/components/Sidebar';
import Topnav from '@/src/components/Topnav';
import { useGame } from '@/src/lib/GameContext';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  const { cash, portfolioValue } = useGame();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [status, session, router]);

  if (status === 'loading' || status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role === 'ADMIN')) {
    return <div className="min-h-screen bg-[#090e17] flex items-center justify-center text-white">Loading...</div>;
  }

  // Map Next.js pathnames back to the ViewType strings the UI expects
  const getCurrentView = () => {
    if (pathname.includes('/market') || pathname.includes('/team')) return 'market';
    if (pathname.includes('/portfolio')) return 'portfolio';
    if (pathname.includes('/leaderboard')) return 'leaderboard';
    if (pathname.includes('/standings')) return 'standings';
    if (pathname.includes('/schedule')) return 'schedule';
    if (pathname.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const currentView = getCurrentView();

  const handleViewChange = (view: string) => {
    if (view === 'dashboard') router.push('/');
    else router.push(`/${view}`);
  };

  return (
    <div className="relative font-sans antialiased flex">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isAdminMode={false}
        onAdminModeToggle={() => router.push('/admin/login')}
        cash={cash}
        portfolioValue={portfolioValue}
      />
      <div className="flex-1">
        <Topnav
          currentView={currentView}
          onViewChange={handleViewChange}
          cash={cash}
          portfolioValue={portfolioValue}
          onAdminToggle={() => router.push('/admin/login')}
          isAdminMode={false}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="pt-24 pb-20 md:pb-8 pl-4 pr-4 lg:pl-72 lg:pr-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
