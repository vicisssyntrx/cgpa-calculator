'use client';

import { Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { Semester } from '@/types/calculator';
import { cn } from '@/utils/cn';

interface SGPAInputProps {
  semesters: Semester[];
  onUpdate: (semesters: Semester[]) => void;
}

export function SGPAInput({ semesters, onUpdate }: SGPAInputProps) {
  const addSemester = () => {
    const newSemester: Semester = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Semester ${semesters.length + 1}`,
      subjects: [],
      sgpa: 0,
      totalCredits: 0,
    };
    onUpdate([...semesters, newSemester]);
  };

  const removeSemester = (id: string) => {
    onUpdate(semesters.filter(s => s.id !== id));
  };

  const updateSemester = (id: string, updates: Partial<Semester>) => {
    onUpdate(semesters.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          Enter SGPA
        </h3>
        <button
          onClick={addSemester}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add Semester
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {semesters.map((semester, index) => (
          <div 
            key={semester.id}
            className="p-6 rounded-2xl bg-card border border-border group animate-in zoom-in-95"
          >
            <div className="flex justify-between items-start mb-4">
              <input
                type="text"
                className="bg-transparent border-none font-bold text-lg outline-none focus:ring-0 w-2/3"
                value={semester.name}
                onChange={(e) => updateSemester(semester.id, { name: e.target.value })}
              />
              <button
                onClick={() => removeSemester(semester.id)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">SGPA</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-secondary/50 border-none rounded-lg p-3 text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={semester.sgpa || ''}
                  onChange={(e) => updateSemester(semester.id, { sgpa: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Total Credits</label>
                <input
                  type="number"
                  placeholder="20"
                  className="w-full bg-secondary/50 border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={semester.totalCredits || ''}
                  onChange={(e) => updateSemester(semester.id, { totalCredits: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {semesters.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No semesters added yet.</p>
        </div>
      )}
    </div>
  );
}
