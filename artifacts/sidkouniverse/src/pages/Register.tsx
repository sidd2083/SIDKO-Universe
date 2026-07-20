import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { getAuth, signInWithCustomToken, updateProfile } from 'firebase/auth';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { apiUrl } from '@/lib/apiBase';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 6) return;

    setIsLoading(true);
    try {
      // Server creates the Firebase user via Admin SDK (no Email/Password
      // provider needed), stores the password hash, and returns a custom token.
      const res = await fetch(apiUrl('/api/visitor/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed.');

      // Exchange custom token for a Firebase session
      const credential = await signInWithCustomToken(getAuth(), data.customToken);
      await updateProfile(credential.user, { displayName: username.toLowerCase().replace(/[^a-z0-9]/g, '') });

      toast({ title: 'Account created! Welcome 👋' });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create account.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-xl">S</div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Join my universe. Takes 10 seconds.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Only lowercase letters and numbers"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !username.trim() || password.length < 6}
            className="w-full bg-foreground text-background py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </PageWrapper>
  );
}
