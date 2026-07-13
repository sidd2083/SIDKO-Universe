import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsLoading(true);
    try {
      const email = `${username.toLowerCase().trim()}@sidkouniverse.local`;
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!" });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive"
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
          <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your username to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:brightness-110 transition-all flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Register here</Link>
        </p>
      </div>
    </PageWrapper>
  );
}