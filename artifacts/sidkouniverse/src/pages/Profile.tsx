import React from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { useLocation } from 'wouter';

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOut(getAuth());
    }
    setLocation('/');
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <div className="bg-card border border-border rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {user.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.displayName}</h2>
              <p className="text-muted-foreground">{isAdmin ? 'Universe Admin' : 'Visitor'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-destructive/10 text-destructive px-6 py-2.5 rounded-xl font-medium hover:bg-destructive/20 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </PageWrapper>
  );
}