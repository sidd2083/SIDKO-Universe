import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      setLocation('/dashboard');
    }
  }, [isAdmin, authLoading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) return;

    setIsLoading(true);
    const email = `${username.toLowerCase().trim()}@sidkouniverse.local`;

    try {
      // Try signing in first
      await signInWithEmailAndPassword(auth, email, password);
      setLocation('/dashboard');
    } catch (err: any) {
      const code = err?.code ?? '';

      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        // First time setup: auto-create the account
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          setLocation('/dashboard');
        } catch (createErr: any) {
          const cc = createErr?.code ?? '';
          if (cc === 'auth/email-already-in-use') {
            setError('Wrong password.');
          } else if (cc === 'auth/operation-not-allowed') {
            setError('Email/Password sign-in is not enabled in Firebase Console → Authentication → Sign-in method.');
          } else {
            setError('Access denied. Check Firebase Auth is enabled.');
          }
        }
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials') {
        setError('Wrong password.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Enable Email/Password in Firebase Console → Authentication → Sign-in method.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection.');
      } else {
        setError('Access denied.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Private Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="off"
            autoCapitalize="none"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/50 text-sm"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/50 text-sm"
            required
          />
          {error && (
            <p className="text-xs text-destructive text-center leading-relaxed">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="w-full bg-foreground text-background py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 mt-1"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
