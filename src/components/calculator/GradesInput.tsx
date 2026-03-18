'use client';

import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { Subject, GradingSystem } from '@/types/calculator';
import { cn } from '@/utils/cn';
import { gradeToPoints, GRADING_SCALES } from '@/utils/calculations';

interface GradesInputProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => void;
  gradingSystem: GradingSystem;
}

export function GradesInput({ subjects, onUpdate, gradingSystem }: GradesInputProps) {
  const addSubject = () => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      credits: 3,
      grade: '',
      gradePoints: 0,
    };
    onUpdate([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    onUpdate(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    onUpdate(subjects.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        if (updated.grade !== undefined) {
          updated.gradePoints = gradeToPoints(updated.grade, gradingSystem);
        }
        return updated;
      }
      return s;
    }));
  };

  const availableGrades = GRADING_SCALES[gradingSystem].map(m => m.grade);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Enter Grades
        </h3>
        <button
          onClick={addSubject}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="space-y-4">
        {subjects.map((subject, index) => (
          <div 
            key={subject.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/50 group hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-black text-foreground/70 uppercase tracking-wider px-1">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Physics"
                className="w-full bg-card border border-border/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                value={subject.name}
                onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
              />
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-black text-foreground/70 uppercase tracking-wider px-1">Credits</label>
              <input
                type="number"
                className="w-full bg-card border border-border/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                value={subject.credits}
                onChange={(e) => updateSubject(subject.id, { credits: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-foreground/70 uppercase tracking-wider px-1">Grade</label>
              <select
                className="w-full bg-card border border-border/50 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all font-bold"
                value={subject.grade}
                onChange={(e) => updateSubject(subject.id, { grade: e.target.value })}
              >
                <option value="">Select</option>
                {availableGrades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 flex flex-col justify-center items-center space-y-1 border-l border-border/50">
              <label className="text-xs font-black text-foreground/70 uppercase tracking-wider">Points</label>
              <div className="font-black text-xl text-primary">{subject.gradePoints}</div>
            </div>
            <div className="md:col-span-1 flex items-end md:items-center justify-end">
              <button
                onClick={() => removeSubject(subject.id)}
                className="p-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                title="Remove Subject"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {subjects.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No subjects added yet. Click "Add Subject" to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
