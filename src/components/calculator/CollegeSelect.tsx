'use client';

import { useState, useEffect } from 'react';
import { Search, School, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GradingSystem } from '@/types/calculator';

interface College {
  id: string;
  name: string;
  gradingSystem: GradingSystem;
}

interface CollegeSelectProps {
  onSelect: (college: College) => void;
  selectedId?: string;
}

export function CollegeSelect({ onSelect, selectedId }: CollegeSelectProps) {
  const [query, setQuery] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges${query ? `?q=${query}` : ''}`);
        const data = await res.json();
        setColleges(data);
      } catch (e) {
        console.error('Failed to fetch colleges', e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchColleges, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const selectedCollege = colleges.find(c => c.id === selectedId);

  return (
    <div className="relative w-full max-w-md mx-auto z-50">
      <div 
        className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search your college..."
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="mt-2 p-2 rounded-2xl bg-card border border-border shadow-xl z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : colleges.length > 0 ? (
            colleges.map((college) => (
              <button
                key={college.id}
                onClick={() => {
                  onSelect(college);
                  setQuery(college.name);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-colors hover:bg-secondary",
                  selectedId === college.id && "bg-primary/10 text-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <School className="w-4 h-4" />
                  <span>{college.name}</span>
                </div>
                {selectedId === college.id && <Check className="w-4 h-4" />}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No colleges found.</div>
          )}
        </div>
      )}
    </div>
  );
}
