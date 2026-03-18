'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, HelpCircle, Calendar, Trash2, ShieldCheck, RefreshCcw, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import Link from 'next/link';

interface Feedback {
  id: string;
  type: 'feedback' | 'question';
  text: string;
  created_at: string;
}

const ADMIN_TOKEN = 'viciss-admin-42-x9k2';

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/feedback?adminToken=${ADMIN_TOKEN}`);
      if (!response.ok) {
        throw new Error('Unauthorized or API Error');
      }
      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 selection:bg-primary selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-xs">
              <ShieldCheck className="w-4 h-4" />
              Secure Admin Portal
            </div>
            <h1 className="text-4xl font-black md:text-5xl tracking-tighter">
              User <span className="text-primary italic">Feedbacks.</span>
            </h1>
            <p className="text-muted-foreground font-medium">Real-time questions and feedback from CGPA Calculator users.</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={fetchFeedbacks}
              className="flex items-center gap-2 px-6 py-3 bg-secondary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-lg active:scale-95"
            >
              <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
              Refresh
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Link>
          </div>
        </header>

        {/* Content Area */}
        {loading && feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-xs">Fetching Secure Data...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4">
            <p className="text-red-500 font-bold">Access Denied: {error}</p>
            <p className="text-sm opacity-60">Please ensure your secure token is valid or check your connection.</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-32 opacity-40">
             <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
             <p className="text-2xl font-black lowercase italic">No messages yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {feedbacks.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col p-8 bg-card border border-border rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm",
                      f.type === 'feedback' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {f.type}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(f.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <blockquote className="flex-1 text-base font-medium leading-relaxed mb-6 italic opacity-90">
                    "{f.text}"
                  </blockquote>

                  <div className="flex items-center gap-2 pt-6 border-t border-border/50 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="p-2 bg-secondary rounded-xl">
                      {f.type === 'feedback' ? <MessageSquare className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{f.id.split('-')[0]}...</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 -z-10 w-full h-full opacity-30 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
