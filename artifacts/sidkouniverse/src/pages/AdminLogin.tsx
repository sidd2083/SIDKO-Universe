import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { setAdminSession } from '@/contexts/AuthContext';

// SHA-256 hashes of the valid credentials.
// Plaintext never lives in the browser bundle — only the hashes.
const VALID_USERNAME_HASH = '3477e5f0bebcbadab458297d38ee342a219d431f2e6848886658f44c8487bf28';
const VALID_PASSWORD_HASH = 'd2e0f306ec7bf03dd9277e2110557f15cf5615dabfe800c85bc9c68ed77eaf62';

async function sha256hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function checkCredentials(username: string, password: string): Promise<boolean> {
  const [uHash, pHash] = await Promise.all([sha256hex(username), sha256hex(password)]);
  return uHash === VALID_USERNAME_HASH && pHash === VALID_PASSWORD_HASH;
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      setLocation('/dashboard');
    }
  }, [isAdmin, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const ok = await checkCredentials(username.trim(), password.trim());
      if (!ok) {
        setError('Wrong username or password.');
        return;
      }

      // Mark session in browser storage and notify AuthContext
      setAdminSession();
      window.dispatchEvent(new Event('sidko_admin_changed'));

      // Also fire the API login in the background so the cookie session is set too
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      }).catch(() => { /* non-critical */ });

      setLocation('/dashboard');
    } catch {
      setError('Something went wrong. Try again.');
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

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          <div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
              className="w-full bg-card border border-border text-foreground px-4 py-3 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border disabled:opacity-40"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full bg-card border border-border text-foreground px-4 py-3 pr-11 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border disabled:opacity-40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-destructive text-center leading-relaxed px-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-background py-3 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 mt-1"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          Only authorised accounts can enter.
        </p>
      </motion.div>
    </div>
  );
}
