import { GradingSystem, GradeMapping } from '../types/calculator';

export const GRADING_SCALES: Record<GradingSystem, GradeMapping[]> = {
  '10-point': [
    { grade: 'O', points: 10, minMarks: 90, maxMarks: 100 },
    { grade: 'A+', points: 9, minMarks: 80, maxMarks: 89 },
    { grade: 'A', points: 8, minMarks: 70, maxMarks: 79 },
    { grade: 'B+', points: 7, minMarks: 60, maxMarks: 69 },
    { grade: 'B', points: 6, minMarks: 50, maxMarks: 59 },
    { grade: 'C', points: 5, minMarks: 40, maxMarks: 49 },
    { grade: 'P', points: 4, minMarks: 33, maxMarks: 39 },
    { grade: 'F', points: 0, minMarks: 0, maxMarks: 32 },
  ],
  '4-point': [
    { grade: 'A', points: 4.0, minMarks: 90, maxMarks: 100 },
    { grade: 'A-', points: 3.7, minMarks: 87, maxMarks: 89 },
    { grade: 'B+', points: 3.3, minMarks: 83, maxMarks: 86 },
    { grade: 'B', points: 3.0, minMarks: 80, maxMarks: 82 },
    { grade: 'B-', points: 2.7, minMarks: 77, maxMarks: 79 },
    { grade: 'C+', points: 2.3, minMarks: 73, maxMarks: 76 },
    { grade: 'C', points: 2.0, minMarks: 70, maxMarks: 72 },
    { grade: 'C-', points: 1.7, minMarks: 67, maxMarks: 69 },
    { grade: 'D+', points: 1.3, minMarks: 63, maxMarks: 66 },
    { grade: 'D', points: 1.0, minMarks: 60, maxMarks: 62 },
    { grade: 'F', points: 0.0, minMarks: 0, maxMarks: 59 },
  ],
};

export const calculateSGPA = (subjects: { credits: number; gradePoints: number }[]): number => {
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits === 0) return 0;
  
  const totalPoints = subjects.reduce((sum, s) => sum + (s.gradePoints * s.credits), 0);
  return Number((totalPoints / totalCredits).toFixed(2));
};

export const calculateCGPA = (semesters: { sgpa: number; totalCredits: number }[]): number => {
  const totalCredits = semesters.reduce((sum, s) => sum + s.totalCredits, 0);
  if (totalCredits === 0) return 0;
  
  const totalPoints = semesters.reduce((sum, s) => sum + (s.sgpa * s.totalCredits), 0);
  return Number((totalPoints / totalCredits).toFixed(2));
};

export const marksToGradePoints = (marks: number, maxMarks: number, scale: GradingSystem): number => {
  const percentage = (marks / maxMarks) * 100;
  const mapping = GRADING_SCALES[scale];
  
  const found = mapping.find(m => percentage >= (m.minMarks || 0) && percentage <= (m.maxMarks || 100));
  return found ? found.points : 0;
};

export const gradeToPoints = (grade: string, scale: GradingSystem): number => {
  const found = GRADING_SCALES[scale].find(m => m.grade.toUpperCase() === grade.toUpperCase());
  return found ? found.points : 0;
};
