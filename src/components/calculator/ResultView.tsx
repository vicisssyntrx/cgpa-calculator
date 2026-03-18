'use client';

import { motion } from 'framer-motion';
import { 
  Trophy, 
  Download, 
  Share2, 
  ChevronRight,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Semester, GradingSystem } from '@/types/calculator';
import { cn } from '@/utils/cn';

interface ResultViewProps {
  cgpa: number;
  semesters: Semester[];
  gradingSystem: GradingSystem;
  onExport: () => void;
}

export function ResultView({ cgpa, semesters, gradingSystem, onExport }: ResultViewProps) {
  const maxScore = gradingSystem === '10-point' ? 10 : 4;
  const percentage = (cgpa / maxScore) * 100;
  
  const getClassification = (score: number, system: GradingSystem) => {
    if (system === '10-point') {
      if (score >= 9) return { label: 'Outstanding', color: 'text-yellow-500', icon: Trophy };
      if (score >= 8) return { label: 'First Class with Distinction', color: 'text-blue-500', icon: Award };
      if (score >= 6.5) return { label: 'First Class', color: 'text-green-500', icon: Star };
      return { label: 'Pass', color: 'text-muted-foreground', icon: ChevronRight };
    } else {
      if (score >= 3.8) return { label: 'Summa Cum Laude', color: 'text-yellow-500', icon: Trophy };
      if (score >= 3.6) return { label: 'Magna Cum Laude', color: 'text-blue-500', icon: Award };
      if (score >= 3.4) return { label: 'Cum Laude', color: 'text-green-500', icon: Star };
      return { label: 'Good Standing', color: 'text-muted-foreground', icon: ChevronRight };
    }
  };

  const classification = getClassification(cgpa, gradingSystem);

  const chartData = semesters.map(s => ({
    name: s.name,
    sgpa: s.sgpa || 0,
  }));

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Card */}
      <div className="relative overflow-hidden p-8 md:p-12 rounded-[2.5rem] bg-foreground text-background shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-4">
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">Your Final CGPA</p>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <h2 className="text-7xl md:text-9xl font-black">{cgpa.toFixed(2)}</h2>
              <span className="text-2xl opacity-40 font-bold">/ {maxScore}</span>
            </div>
            <div className={cn("flex items-center gap-2 font-bold px-4 py-2 bg-background/10 rounded-full w-fit mx-auto md:mx-0", classification.color)}>
              <classification.icon className="w-5 h-5" />
              {classification.label}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
             <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="opacity-10"
                  />
                  <circle
                    cx="64" cy="64" r="58"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * percentage) / 100}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black">{Math.round(percentage)}%</span>
                  <p className="text-[10px] font-bold opacity-60">EQUIVALENT</p>
                </div>
             </div>
             <button 
              onClick={onExport}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform"
             >
                <Download className="w-5 h-5" />
                Download PDF
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div className="md:col-span-2 p-8 rounded-3xl bg-card border border-border">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Trend
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis domain={[0, maxScore]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="sgpa" radius={[10, 10, 10, 10]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.sgpa >= (maxScore * 0.8) ? '#2563eb' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
           <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
              <p className="text-xs font-bold text-primary uppercase mb-1">Total Credits</p>
              <h4 className="text-3xl font-black">{semesters.reduce((sum, s) => sum + (s.totalCredits || 0), 0)}</h4>
           </div>
           <div className="p-6 rounded-3xl bg-card border border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Semesters</p>
              <h4 className="text-3xl font-black">{semesters.length}</h4>
           </div>
           <button className="w-full flex items-center justify-between p-6 rounded-3xl bg-secondary hover:bg-secondary/80 transition-colors">
              <span className="font-bold">Share Result</span>
              <Share2 className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
