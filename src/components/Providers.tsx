"use client";

import { SessionProvider } from "next-auth/react";
import { GameProvider } from "@/src/lib/GameContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </SessionProvider>
  );
}
