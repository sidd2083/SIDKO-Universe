import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <PageWrapper className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="bg-card border border-border rounded-3xl h-full flex overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-1/3 min-w-[250px] border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="p-3 bg-muted rounded-xl flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                S
              </div>
              <div>
                <p className="font-medium text-sm">Siddhant</p>
                <p className="text-xs text-muted-foreground">Select to start chatting</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-background/50">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="font-medium text-foreground text-lg mb-2">Your Messages</h3>
          <p className="text-sm">Select a conversation to start chatting directly with Siddhant.</p>
          <p className="text-xs mt-4 text-primary bg-primary/10 px-3 py-1 rounded-full">Coming soon</p>
        </div>
      </div>
    </PageWrapper>
  );
}