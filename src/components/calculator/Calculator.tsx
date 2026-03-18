'use client';

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
  LayoutDashboard,
  Heart,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { InputMethod, Semester, Subject } from '@/types/calculator';
import { useCalculator } from '@/hooks/useCalculator';
import { cn } from '@/utils/cn';
import Link from 'next/link';

// Components
// import { CollegeSelect } from './CollegeSelect'; // Removed as requested
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'question' | 'feedback'>('feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    if (state.semesters.length === 0) {
      addSemester();
    }
    setCurrentStep(1); // Now goes straight to input
  };

  // Removed handleCollegeSelect as requested
  // const handleCollegeSelect = (college: any) => {
  //   updateGradingSystem(college.gradingSystem);
  //   setSelectedCollegeName(college.name);
  // };

  const currentSemester = state.semesters[0]; // For single-step inputs like Marks/Grades

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    setIsSubmittingFeedback(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: feedbackType, text: feedbackText }),
      });

      if (response.ok) {
        setFeedbackSuccess(true);
        setFeedbackText('');
        setTimeout(() => {
            setFeedbackSuccess(false);
            setIsFeedbackOpen(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to send feedback:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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
          <h1 className="text-2xl font-black text-foreground">
            CGPA Calculator
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            {mounted && (resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-foreground" />)}
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
              className="w-full space-y-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <button onClick={prevStep} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-3xl font-black">Input Your Data</h2>
                </div>
                
                <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-border">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Grading System:</span>
                  <select 
                    className="bg-transparent font-bold cursor-pointer outline-none text-primary"
                    value={state.gradingSystem}
                    onChange={(e) => updateGradingSystem(e.target.value as any)}
                  >
                    <option value="10-point">10-Point Scale</option>
                    <option value="4-point">4-Point Scale</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-card p-4 md:p-8 rounded-[2rem] border border-border shadow-xl">
                {renderInputModule()}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={nextStep}
                  className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Calculate Results
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full flex justify-center"
            >
              <div className="w-full">
                 <div className="flex items-center gap-4 mb-8">
                  <button onClick={prevStep} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
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

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-8 text-center">
        <p className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by 
          <Link 
            href="https://Viciss.framer.website" 
            target="_blank" 
            className="text-foreground font-bold hover:text-primary transition-colors hover:underline underline-offset-4"
          >
            Viciss_Syntrx
          </Link>
        </p>
      </footer>

      {/* Floating Feedback Button */}
      <div className="fixed bottom-8 left-8 z-50">
        <button
          onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          {isFeedbackOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          Feedback
        </button>

        <AnimatePresence>
          {isFeedbackOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 left-0 w-80 bg-card/95 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-2xl"
            >
              <h3 className="text-xl font-black mb-4">Send Feedback</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                  <button
                    onClick={() => setFeedbackType('feedback')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                      feedbackType === 'feedback' ? "bg-primary text-white shadow-md" : "text-muted-foreground"
                    )}
                  >
                    Feedback
                  </button>
                  <button
                    onClick={() => setFeedbackType('question')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                      feedbackType === 'question' ? "bg-primary text-white shadow-md" : "text-muted-foreground"
                    )}
                  >
                    Question
                  </button>
                </div>

                {feedbackSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center space-y-2"
                  >
                    <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-green-500">Feedback Sent!</p>
                    <p className="text-xs text-muted-foreground italic">Thank you for helping us improve.</p>
                  </motion.div>
                ) : (
                  <>
                    <textarea
                      placeholder={feedbackType === 'feedback' ? "What can we improve?" : "Ask a question..."}
                      className="w-full h-32 bg-secondary border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      disabled={isSubmittingFeedback}
                    />

                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackText.trim() || isSubmittingFeedback}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-foreground text-background rounded-2xl font-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                      {isSubmittingFeedback ? (
                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {feedbackType === 'feedback' ? 'Send Feedback' : 'Send Question'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
