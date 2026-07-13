import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useFirestore } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/shared/Skeleton';
import { collection, addDoc, orderBy, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, MessageSquare, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function Anonymous() {
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: messages, loading } = useFirestore<any>('anonymous_messages', [
    where('approved', '==', true),
    orderBy('createdAt', 'desc')
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'anonymous_messages'), {
        question: question.trim(),
        approved: false,
        pinned: false,
        likesCount: 0,
        createdAt: serverTimestamp()
      });
      setQuestion('');
      toast({
        title: "Message sent!",
        description: "Your message was sent anonymously to Siddhant.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Anonymous</h1>
        <p className="text-muted-foreground text-center mb-10 max-w-lg mx-auto">
          Send me a message, ask a question, or tell me a secret. 
          I won't know who you are unless you choose to tell me.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-16"
        >
          <form onSubmit={handleSubmit}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What's on your mind?..."
              className="w-full bg-background border border-border rounded-xl p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmitting || !question.trim()}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? 'Sending...' : (
                  <>Send Message <Send className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Public Replies
          </h2>
          
          {loading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      {msg.pinned && (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-1 rounded">Pinned</span>
                      )}
                    </div>
                    
                    <div className="mb-6 relative">
                      <div className="absolute -left-3 top-0 bottom-0 w-1 bg-muted rounded-full"></div>
                      <p className="text-lg font-medium text-foreground pl-3 italic opacity-90">
                        "{msg.question}"
                      </p>
                    </div>
                    
                    <div className="bg-background/50 border border-border/50 rounded-xl p-4 flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">S</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">Siddhant</span>
                          <span className="text-xs text-muted-foreground">
                            {msg.createdAt ? format(msg.createdAt.toDate(), 'MMM d, yyyy') : ''}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.reply}
                        </p>
                      </div>
                    </div>
                    
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground">No public replies yet. Be the first to ask!</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}