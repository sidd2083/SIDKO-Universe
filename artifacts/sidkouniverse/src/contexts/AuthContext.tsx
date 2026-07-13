import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useGetAdminSession } from '@workspace/api-client-react';

interface AuthContextType {
  /** Regular site-visitor account (Firebase Auth), independent of admin. */
  user: User | null;
  /** Admin session, backed by the API server (siddhant login at /balen). */
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUserLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      setUser(currentUser);
      setUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { staleTime: 60_000 },
  });

  const isAdmin = Boolean(session?.isAdmin);
  const isLoading = userLoading || sessionLoading;

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
