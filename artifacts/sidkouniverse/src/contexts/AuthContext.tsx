import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useGetAdminSession } from '@workspace/api-client-react';

// Import adminAuth so the auth token getter is registered with customFetch
// on module load — this must happen before any API call is made.
import '@/lib/adminAuth';

const SESSION_KEY = 'sidko_admin_v1';

/** Mark the current browser session as admin (called after successful login). */
export function setAdminSession() {
  // Use localStorage so the session survives tab closes and page refreshes.
  localStorage.setItem(SESSION_KEY, '1');
}

/** Clear the admin session (called on logout). */
export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Returns true if localStorage has a valid admin flag. */
function readAdminSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === '1';
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

  // useGetAdminSession now sends the Bearer token (via setAuthTokenGetter
  // registered in adminAuth.ts), so this correctly reflects server-side state.
  const { data: session, isLoading: sessionLoading } = useGetAdminSession();

  // Admin ONLY when the server confirms via Bearer token.
  // localStorage is purely a hint that we *might* be admin; the server is the
  // authority and must respond before guards can make the call.
  const isAdmin = Boolean(session?.isAdmin);

  // Stay in loading state until BOTH Firebase and the server session check
  // have resolved — this prevents dashboard guards from firing prematurely
  // and ejecting a valid admin before the server responds.
  const isLoading = userLoading || sessionLoading;

  // If the server says we're admin but localStorage flag is missing, restore it.
  useEffect(() => {
    if (session?.isAdmin && !sessionAdmin) {
      setAdminSession();
      setSessionAdmin(true);
    }
  }, [session?.isAdmin, sessionAdmin]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
