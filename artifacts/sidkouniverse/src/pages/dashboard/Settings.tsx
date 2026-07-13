import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

export default function Settings() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    heroText: '',
    currentStatus: '',
    currentMood: '',
    currentGoal: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, isLoading, setLocation]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const d = await getDoc(doc(db, 'settings', 'main'));
        if (d.exists()) {
          setSettings(d.data() as any);
        }
      } finally {
        setIsFetching(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'main'), settings, { merge: true });
      toast({ title: 'Settings saved successfully' });
    } catch (err) {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const statusPresets = ['Building StudentHub', 'Studying for exams', 'At the Gym', 'Sleeping 😴', 'Learning AI/ML'];
  const moodPresets = ['Focused', 'Tired', 'Energetic', 'Chill', 'Creative'];

  if (isLoading || isFetching || !isAdmin) return null;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Site Settings</h1>

        <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
          
          <div>
            <label className="block text-sm font-medium mb-2">Hero Text (Home Page)</label>
            <input
              type="text"
              value={settings.heroText}
              onChange={(e) => setSettings({...settings, heroText: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Status (Now Badge)</label>
            <input
              type="text"
              value={settings.currentStatus}
              onChange={(e) => setSettings({...settings, currentStatus: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex flex-wrap gap-2">
              {statusPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSettings({...settings, currentStatus: preset})}
                  className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Mood</label>
            <input
              type="text"
              value={settings.currentMood}
              onChange={(e) => setSettings({...settings, currentMood: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex flex-wrap gap-2">
              {moodPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSettings({...settings, currentMood: preset})}
                  className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Current Global Goal</label>
            <input
              type="text"
              value={settings.currentGoal}
              onChange={(e) => setSettings({...settings, currentGoal: e.target.value})}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}