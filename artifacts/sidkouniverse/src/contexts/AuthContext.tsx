import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useGetAdminSession } from '@workspace/api-client-react';

const SESSION_KEY = 'sidko_admin_v1';

/** Mark the current browser session as admin (called after successful login). */
export function setAdminSession() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

/** Clear the admin session (called on logout). */
export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Returns true if the browser sessionStorage has a valid admin flag. */
function readAdminSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

interface AuthContextType {
  user: User | null;
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
  const [sessionAdmin, setSessionAdmin] = useState(readAdminSession);

  // Listen for our custom event so AdminLogin can trigger a re-render
  useEffect(() => {
    const handler = () => setSessionAdmin(readAdminSession());
    window.addEventListener('sidko_admin_changed', handler);
    return () => window.removeEventListener('sidko_admin_changed', handler);
  }, []);

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

  const { data: session, isLoading: sessionLoading } = useGetAdminSession();

  // Admin if EITHER the browser session flag is set OR the API cookie session says so
  const isAdmin = sessionAdmin || Boolean(session?.isAdmin);
  const isLoading = userLoading || (!sessionAdmin && sessionLoading);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
