import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { setAdminSession } from '@/contexts/AuthContext';
import { setAdminToken } from '@/lib/adminAuth';
import { apiUrl } from '@/lib/apiBase';

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
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as any).error ?? 'Wrong username or password.');
        return;
      }

      const data = await res.json();

      // Store the signed token in sessionStorage — sent as Authorization: Bearer
      // on every admin request, bypassing any cookie proxy issues.
      if (data.token) {
        setAdminToken(data.token);
      }

      // Mark session in browser storage so AuthContext shows admin UI
      setAdminSession();
      window.dispatchEvent(new Event('sidko_admin_changed'));
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
