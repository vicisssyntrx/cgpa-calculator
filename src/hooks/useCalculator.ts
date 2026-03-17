import { useState, useCallback, useEffect } from 'react';
import { 
  CalculatorState, 
  Semester, 
  Subject, 
  GradingSystem, 
  InputMethod 
} from '../types/calculator';
import { calculateCGPA, calculateSGPA } from '../utils/calculations';

const STORAGE_KEY = 'cgpa_calculator_data';

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    gradingSystem: '10-point',
    semesters: [],
    totalCGPA: 0,
  });

  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved data', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (state.semesters.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateGradingSystem = (system: GradingSystem) => {
    setState(prev => ({ ...prev, gradingSystem: system }));
  };

  const addSemester = () => {
    const newSemester: Semester = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Semester ${state.semesters.length + 1}`,
      subjects: [],
      sgpa: 0,
      totalCredits: 0,
    };
    setState(prev => ({
      ...prev,
      semesters: [...prev.semesters, newSemester],
    }));
  };

  const updateSemester = (semesterId: string, updates: Partial<Semester>) => {
    setState(prev => {
      const newSemesters = prev.semesters.map(s => 
        s.id === semesterId ? { ...s, ...updates } : s
      );
      
      const target = newSemesters.find(s => s.id === semesterId)!;
      
      // If subjects changed, calculate SGPA
      if (updates.subjects) {
        target.sgpa = calculateSGPA(target.subjects.map(sub => ({
          credits: sub.credits,
          gradePoints: sub.gradePoints || 0
        })));
        target.totalCredits = target.subjects.reduce((sum, sub) => sum + sub.credits, 0);
      }

      // Always recalculate total CGPA after any change
      const totalCGPA = calculateCGPA(newSemesters.map(sem => ({
        sgpa: sem.sgpa || 0,
        totalCredits: sem.totalCredits || 0
      })));

      return { ...prev, semesters: newSemesters, totalCGPA };
    });
  };

  const reset = () => {
    setState({
      gradingSystem: '10-point',
      semesters: [],
      totalCGPA: 0,
    });
    setInputMethod(null);
    setCurrentStep(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    state,
    inputMethod,
    setInputMethod,
    currentStep,
    setCurrentStep,
    updateGradingSystem,
    addSemester,
    updateSemester,
    reset,
  };
}
