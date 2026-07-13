import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginAdmin, getGetAdminSessionQueryKey } from '@workspace/api-client-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const loginMutation = useLoginAdmin();

  useEffect(() => {
    if (!authLoading && isAdmin) {
      setLocation('/dashboard');
    }
  }, [isAdmin, authLoading, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) return;

    loginMutation.mutate(
      { data: { username: username.trim(), password } },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: getGetAdminSessionQueryKey() });
          setLocation('/dashboard');
        },
        onError: (err: any) => {
          if (err?.status === 401) {
            setError('Wrong username or password.');
          } else {
            setError('Access denied.');
          }
        },
      },
    );
  };

  const isLoading = loginMutation.isPending;

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
