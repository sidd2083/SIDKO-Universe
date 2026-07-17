import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { withAdminHeaders } from '@/lib/adminAuth';
import { Loader2, Save } from 'lucide-react';

interface SiteSettings { heroText: string; currentStatus: string; currentMood: string; currentGoal: string; statusEmoji: string; }

const DEFAULT: SiteSettings = { heroText: '', currentStatus: '', currentMood: '', currentGoal: '', statusEmoji: '💻' };

export default function Settings() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) setLocation('/');
  }, [isAdmin, isLoading, setLocation]);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then((data: SiteSettings) => setSettings({ ...DEFAULT, ...data }))
      .catch(() => {})
      .finally(() => setIsFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        credentials: 'include',
        headers: withAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Save failed');
      toast({ title: 'Settings saved!' });
    } catch {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const statusPresets: Array<{ label: string; emoji: string }> = [
    { label: 'Building StudentHub', emoji: '💻' }, { label: 'Studying for exams', emoji: '📚' },
    { label: 'At the Gym', emoji: '💪' }, { label: 'Playing games', emoji: '🎮' },
    { label: 'Sleeping 😴', emoji: '😴' }, { label: 'Learning AI/ML', emoji: '🤖' },
    { label: 'Listening to music', emoji: '🎵' }, { label: 'Out with friends', emoji: '🤝' },
    { label: 'Eating something good', emoji: '🍜' },
  ];
  const moodPresets = ['Focused', 'Tired', 'Energetic', 'Chill', 'Creative', 'Motivated'];

  if (isLoading || isFetching || !isAdmin) return null;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Site Settings</h1>
        <p className="text-muted-foreground mb-8 text-sm">These are stored on the server — no Firebase needed.</p>
        <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-2">Hero Text (Home Page subtitle)</label>
            <input type="text" value={settings.heroText} onChange={e => setSettings({ ...settings, heroText: e.target.value })}
              placeholder="Building things, breaking stuff."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Live Status</label>
            <p className="text-xs text-muted-foreground mb-3">This appears as an animated card at the top of your home page.</p>
            <div className="flex gap-2 mb-3">
              <span className="flex items-center justify-center w-12 h-12 bg-background border border-border rounded-xl text-2xl">{settings.statusEmoji}</span>
              <input type="text" value={settings.currentStatus} onChange={e => setSettings({ ...settings, currentStatus: e.target.value })}
                placeholder="What are you doing right now?"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusPresets.map(preset => (
                <button key={preset.label} type="button"
                  onClick={() => setSettings({ ...settings, currentStatus: preset.label, statusEmoji: preset.emoji })}
                  className="text-xs bg-muted hover:bg-primary/10 hover:text-primary text-foreground px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  <span>{preset.emoji}</span> {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Current Mood</label>
            <input type="text" value={settings.currentMood} onChange={e => setSettings({ ...settings, currentMood: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <div className="flex flex-wrap gap-2">
              {moodPresets.map(preset => (
                <button key={preset} type="button" onClick={() => setSettings({ ...settings, currentMood: preset })}
                  className="text-xs bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg transition-colors">{preset}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Current Global Goal</label>
            <input type="text" value={settings.currentGoal} onChange={e => setSettings({ ...settings, currentGoal: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="pt-4 border-t border-border">
            <button type="submit" disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
