'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Moon,
  Sun,
  LayoutDashboard
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { InputMethod, Semester, Subject } from '@/types/calculator';
import { useCalculator } from '@/hooks/useCalculator';
import { cn } from '@/utils/cn';

// Components
import { CollegeSelect } from './CollegeSelect';
import { MarksInput } from './MarksInput';
import { GradesInput } from './GradesInput';
import { SGPAInput } from './SGPAInput';
import { ResultView } from './ResultView';

// Utils
import { exportToPdf } from '@/utils/exportPdf';

const METHODS: { id: InputMethod; label: string; icon: any; description: string }[] = [
  { 
    id: 'marks', 
    label: 'Subject-wise Marks', 
    icon: BookOpen, 
    description: 'I have my marks for each subject' 
  },
  { 
    id: 'grades', 
    label: 'Subject-wise Grades', 
    icon: GraduationCap, 
    description: 'I have grades (A, B, C...) and credits' 
  },
  { 
    id: 'sgpa', 
    label: 'SGPA for Semesters', 
    icon: LayoutDashboard, 
    description: 'I have SGPA and total credits per semester' 
  },
  { 
    id: 'full-data', 
    label: 'Credits & Grade Points', 
    icon: CheckCircle2, 
    description: 'I have direct grade points and credits' 
  },
  { 
    id: 'unknown', 
    label: 'I don\'t know', 
    icon: HelpCircle, 
    description: 'Guide me step-by-step' 
  },
];

export default function CGPACalculator() {
  const { theme, setTheme } = useTheme();
  const { 
    state, 
    inputMethod, 
    setInputMethod, 
    currentStep, 
    setCurrentStep,
    updateGradingSystem,
    addSemester,
    updateSemester,
    reset 
  } = useCalculator();

  const [selectedCollegeName, setSelectedCollegeName] = useState<string>('');

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    if (state.semesters.length === 0) {
      addSemester();
    }
    setCurrentStep(1);
  };

  const handleCollegeSelect = (college: any) => {
    updateGradingSystem(college.gradingSystem);
    setSelectedCollegeName(college.name);
  };

  const currentSemester = state.semesters[0]; // For single-step inputs like Marks/Grades

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const renderInputModule = () => {
    switch (inputMethod) {
      case 'marks':
        return (
          <MarksInput 
            subjects={currentSemester?.subjects || []} 
            onUpdate={(subs) => updateSemester(currentSemester.id, { subjects: subs })}
            gradingSystem={state.gradingSystem}
          />
        );
      case 'grades':
        return (
          <GradesInput 
            subjects={currentSemester?.subjects || []} 
            onUpdate={(subs) => updateSemester(currentSemester.id, { subjects: subs })}
            gradingSystem={state.gradingSystem}
          />
        );
      case 'sgpa':
      case 'full-data':
        return (
          <SGPAInput 
            semesters={state.semesters}
            onUpdate={(sems) => {
               // This is a bit simplified for the hook, but works for the demo
               // In a real app we'd update individual semesters
               sems.forEach(s => updateSemester(s.id, s));
            }}
          />
        );
      case 'unknown':
        return (
          <div className="space-y-8 py-10">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Let's find the best method for you</h3>
              <p className="text-muted-foreground">Do you see marks (like 85/100) or grades (like A+) on your marksheet?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => handleMethodSelect('marks')} className="px-6 py-3 bg-secondary rounded-xl font-bold hover:bg-primary hover:text-white transition-all">I see Marks</button>
                <button onClick={() => handleMethodSelect('grades')} className="px-6 py-3 bg-secondary rounded-xl font-bold hover:bg-primary hover:text-white transition-all">I see Grades</button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center pb-32">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            V-CGPA
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black md:text-5xl lg:text-6xl tracking-tight">
                  Calculate CGPA <br/><span className="text-primary italic">with Intelligence.</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Select what information you have available, and we'll guide you through the rest.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className="group relative flex flex-col items-start gap-4 p-8 rounded-[2rem] bg-card border border-border hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all text-left"
                  >
                    <div className="p-4 rounded-2xl bg-secondary group-hover:bg-primary/10 transition-colors">
                      <method.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">{method.label}</h3>
                      <p className="text-muted-foreground leading-relaxed">{method.description}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Get Started <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-card p-8 rounded-[2rem] border border-border shadow-sm">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-2xl font-bold">Step 1: Setup Your College</h2>
                  <p className="text-muted-foreground">This helps us apply the correct grading rules automatically.</p>
                </div>
                <CollegeSelect onSelect={handleCollegeSelect} />
                <div className="flex gap-4">
                  <select 
                    className="bg-secondary px-4 py-2 rounded-xl font-bold border-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    value={state.gradingSystem}
                    onChange={(e) => updateGradingSystem(e.target.value as any)}
                  >
                    <option value="10-point">10-Point Scale</option>
                    <option value="4-point">4-Point Scale</option>
                  </select>
                  <button 
                    onClick={nextStep}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <button onClick={prevStep} className="p-2 hover:bg-secondary rounded-xl"><ArrowLeft/></button>
                <h2 className="text-3xl font-black">Step 2: Input Your Data</h2>
              </div>
              
              <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl">
                {renderInputModule()}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={nextStep}
                  className="px-12 py-5 bg-foreground text-background rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-transform"
                >
                  Calculate Results
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full flex justify-center"
            >
              <div className="w-full w-full">
                 <div className="flex items-center gap-4 mb-8">
                  <button onClick={prevStep} className="p-2 hover:bg-secondary rounded-xl"><ArrowLeft/></button>
                  <h2 className="text-3xl font-black">Your Results</h2>
                </div>
                <ResultView 
                  cgpa={state.totalCGPA} 
                  semesters={state.semesters}
                  gradingSystem={state.gradingSystem}
                  onExport={() => exportToPdf(state.totalCGPA, state.semesters, state.gradingSystem, selectedCollegeName)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistence Indicator */}
      {state.semesters.length > 0 && currentStep > 0 && (
         <div className="fixed bottom-8 right-8 flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border px-4 py-2 rounded-full text-xs font-bold text-muted-foreground shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Progess Saved Locally
         </div>
      )}
    </div>
  );
}
