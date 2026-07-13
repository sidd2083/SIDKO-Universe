import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MusicPlayer } from './MusicPlayer';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex w-full">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-24 md:pb-0 min-h-screen relative">
        <div className="max-w-screen-xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
      <MusicPlayer />
    </div>
  );
}