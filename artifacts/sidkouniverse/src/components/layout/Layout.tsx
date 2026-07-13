import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MusicPlayer } from './MusicPlayer';
import { MobileHeader } from './MobileHeader';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex w-full">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        <MobileHeader />
        <div className="flex-1 pb-28 md:pb-0">
          <div className="max-w-screen-xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </div>
      </main>
      <BottomNav />
      <MusicPlayer />
    </div>
  );
}
