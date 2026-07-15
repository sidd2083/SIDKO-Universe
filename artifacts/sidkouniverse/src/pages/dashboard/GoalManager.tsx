import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { orderBy } from 'firebase/firestore';
import { addFirestoreDoc, updateFirestoreDoc, deleteFirestoreDoc, SERVER_TIMESTAMP } from '@/lib/firestoreApi';
import { useFirestore } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function GoalManager() {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: goals } = useFirestore<any>('goals', [orderBy('order', 'asc')]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/');
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || !isAdmin) return null;

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);
    try {
      await addFirestoreDoc('goals', {
        title,
        description,
        progress: 0,
        targetDate,
        milestones: [],
        order: goals.length,
        createdAt: SERVER_TIMESTAMP,
      });

      setTitle('');
      setDescription('');
      setTargetDate('');
      toast({ title: 'Goal added!' });
    } catch (err) {
      toast({ title: 'Failed to add goal', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await deleteFirestoreDoc('goals', id);
      toast({ title: 'Goal deleted' });
    } catch (err) {
      toast({ title: 'Failed to delete goal', variant: 'destructive' });
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      await updateFirestoreDoc('goals', id, { progress });
    } catch (err) {
      toast({ title: 'Failed to update progress', variant: 'destructive' });
    }
  };

  const handleAddMilestone = async (goalId: string, milestones: any[]) => {
    const title = prompt('Enter milestone title:');
    if (!title) return;
    
    try {
      await updateFirestoreDoc('goals', goalId, {
        milestones: [...milestones, { title, done: false }],
      });
    } catch (err) {
      toast({ title: 'Failed to add milestone', variant: 'destructive' });
    }
  };

  const handleToggleMilestone = async (goalId: string, milestones: any[], index: number) => {
    const newMilestones = [...milestones];
    newMilestones[index].done = !newMilestones[index].done;
    
    try {
      await updateFirestoreDoc('goals', goalId, { milestones: newMilestones });
    } catch (err) {
      toast({ title: 'Failed to update milestone', variant: 'destructive' });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Goal Manager</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <form onSubmit={handleAddGoal} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="font-bold mb-6 text-xl">New Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none h-24"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSaving || !title}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Add Goal
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              {goals?.map(goal => (
                <div key={goal.id} className="bg-card border border-border rounded-3xl p-6 shadow-sm relative">
                  <button 
                    onClick={() => handleDelete(goal.id)}
                    className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="pr-12 mb-6">
                    <h3 className="text-xl font-bold">{goal.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progress ({goal.progress}%)</label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={e => handleUpdateProgress(goal.id, Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm">Milestones</h4>
                      <button 
                        onClick={() => handleAddMilestone(goal.id, goal.milestones || [])}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(goal.milestones || []).map((m: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-background border border-border p-3 rounded-xl">
                          <button onClick={() => handleToggleMilestone(goal.id, goal.milestones, i)}>
                            {m.done ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                          <span className={`text-sm ${m.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                      {(!goal.milestones || goal.milestones.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">No milestones added.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}