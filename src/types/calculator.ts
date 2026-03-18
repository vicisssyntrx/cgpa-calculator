export type GradingSystem = '10-point' | '4-point' | 'nfsu-10';

export interface GradeMapping {
  grade: string;
  points: number;
  minMarks?: number;
  maxMarks?: number;
}

export interface Subject {
  id: string;
  name: string;
  credits: number;
  marks?: number;
  maxMarks?: number;
  grade?: string;
  gradePoints?: number;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
  sgpa?: number;
  totalCredits?: number;
}

export interface CalculatorState {
  gradingSystem: GradingSystem;
  semesters: Semester[];
  totalCGPA: number;
  selectedCollege?: string;
}

export type InputMethod = 'marks' | 'grades' | 'sgpa' | 'full-data' | 'unknown';
