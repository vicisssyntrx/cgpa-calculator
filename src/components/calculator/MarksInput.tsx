'use client';

import { Plus, Trash2, Calculator as CalcIcon } from 'lucide-react';
import { Subject, GradingSystem } from '@/types/calculator';
import { cn } from '@/utils/cn';
import { marksToGradePoints, GRADING_SCALES } from '@/utils/calculations';

interface MarksInputProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => void;
  gradingSystem: GradingSystem;
}

export function MarksInput({ subjects, onUpdate, gradingSystem }: MarksInputProps) {
  const addSubject = () => {
    const newSubject: Subject = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      credits: 3,
      marks: 0,
      maxMarks: 100,
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
        if (updated.marks !== undefined && updated.maxMarks !== undefined) {
          updated.gradePoints = marksToGradePoints(updated.marks, updated.maxMarks, gradingSystem);
        }
        return updated;
      }
      return s;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <CalcIcon className="w-5 h-5 text-primary" />
          Enter Marks
        </h3>
        <button
          onClick={addSubject}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <div className="space-y-3">
        {subjects.map((subject, index) => (
          <div 
            key={subject.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-card border border-border group animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Mathematics"
                className="w-full bg-secondary/50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={subject.name}
                onChange={(e) => updateSubject(subject.id, { name: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Credits</label>
              <input
                type="number"
                className="w-full bg-secondary/50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={subject.credits}
                onChange={(e) => updateSubject(subject.id, { credits: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Marks</label>
              <input
                type="number"
                className="w-full bg-secondary/50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={subject.marks}
                onChange={(e) => updateSubject(subject.id, { marks: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Max Marks</label>
              <input
                type="number"
                className="w-full bg-secondary/50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={subject.maxMarks}
                onChange={(e) => updateSubject(subject.id, { maxMarks: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-1 flex flex-col justify-center items-center space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Points</label>
              <div className="font-bold text-lg text-primary">{subject.gradePoints}</div>
            </div>
            <div className="md:col-span-1 flex items-end md:items-center justify-end">
              <button
                onClick={() => removeSubject(subject.id)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
