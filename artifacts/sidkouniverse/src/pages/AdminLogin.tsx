import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getGetAdminSessionQueryKey } from '@workspace/api-client-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (!authLoading && isAdmin) {
      setLocation('/dashboard');
    }
  }, [isAdmin, authLoading, setLocation]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not configured. Contact the site owner.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      // Force account picker so the user can always choose the right Gmail
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send the ID token to our API — credentials are verified server-side.
      // No username/password ever travels over the wire.
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        // Sign the Firebase user back out since the server rejected the access
        await auth.signOut();
        if (response.status === 403) {
          setError('That Google account is not authorized to access this panel.');
        } else {
          setError((data as any).error || 'Sign-in failed. Try again.');
        }
        return;
      }

      await queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() });
      setLocation('/dashboard');
    } catch (err: any) {
      console.error('[AdminLogin] sign-in error:', err?.code, err?.message, err);
      // User closed the popup or cancelled — no error needed
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Allow popups for this site and try again.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorised in Firebase. Add it under Authentication → Settings → Authorised domains.');
      } else {
        // Show the real Firebase error code so it's debuggable
        setError(`Sign-in failed${err?.code ? ` (${err.code})` : ''}. Try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-border mx-auto mb-5 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Private Access</p>
        </div>

        {error && (
          <p className="text-xs text-destructive text-center leading-relaxed mb-4 px-2">{error}</p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-card border border-border text-foreground py-3 rounded-xl font-medium text-sm hover:bg-foreground/5 transition-all flex items-center justify-center gap-2.5 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          Only authorised accounts can enter.
        </p>
      </motion.div>
    </div>
  );
}
