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
  Send,
  Camera
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { InputMethod, Semester, Subject } from '@/types/calculator';
import { useCalculator } from '@/hooks/useCalculator';
import { cn } from '@/utils/cn';
import Link from 'next/link';

// Components
// Components
import { CollegeSelect } from './CollegeSelect';
import { MarksInput } from './MarksInput';
import { GradesInput } from './GradesInput';
import { SGPAInput } from './SGPAInput';
import { ResultView } from './ResultView';
import { MarksScanner } from './MarksScanner';

// Utils
import { exportToPdf } from '@/utils/exportPdf';

const METHODS: { id: InputMethod; label: string; icon: any; description?: string }[] = [
  { 
    id: 'unknown', 
    label: 'Quick CGPA Calculator', 
    icon: LayoutDashboard
  }
];

export default function CGPACalculator() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'question' | 'feedback'>('feedback');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [showNFSUAsk, setShowNFSUAsk] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
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
    // Check for NFSU detection
    const isNFSU = localStorage.getItem('is_nfsu') === 'true';
    if (!isNFSU && !localStorage.getItem('nfsu_asked')) {
      setTimeout(() => setShowNFSUAsk(true), 1500);
    }
  }, []);

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    if (state.semesters.length === 0) {
      addSemester();
    }
    setCurrentStep(1); // Now goes straight to input
  };

  const handleCollegeSelect = (college: any) => {
    updateGradingSystem(college.gradingSystem);
    setSelectedCollegeName(college.name);
    if (college.name.includes('NFSU')) {
      localStorage.setItem('is_nfsu', 'true');
    }
  };

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

  const handleScanComplete = (subjects: Subject[]) => {
    updateSemester(currentSemester.id, { subjects });
    setIsScanning(false);
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
      case 'unknown':
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
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black text-foreground">
            CGPA Calculator
          </h1>
        </div>
        
        <div className="flex items-center gap-4 z-50">
          <div className="w-64 md:w-80">
            <CollegeSelect 
              onSelect={handleCollegeSelect} 
              selectedId={state.selectedCollege} 
            />
          </div>
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
        {/* Banner with Steps */}
        <div className="mb-8 w-full bg-primary/5 border border-primary/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-black text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Quick Guide
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-full border border-border">
                <span className="w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full font-black">1</span>
                Select Method
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-full border border-border">
                <span className="w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full font-black">2</span>
                Details
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-background rounded-full border border-border">
                <span className="w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full font-black">3</span>
                Result
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-10 w-[1px] bg-border hidden md:block" />
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">NFSU Student?</span>
                <button 
                  onClick={() => {
                    const isNFSU = state.gradingSystem === 'nfsu-10';
                    updateGradingSystem(isNFSU ? '10-point' : 'nfsu-10');
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all",
                    state.gradingSystem === 'nfsu-10' 
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    state.gradingSystem === 'nfsu-10' ? "bg-white" : "bg-primary"
                  )} />
                  {state.gradingSystem === 'nfsu-10' ? "NFSU Mode Active" : "Switch to NFSU"}
                </button>
             </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-4">
                
                <h2 className="text-4xl font-black md:text-5xl lg:text-6xl tracking-tight mt-8">
                  Calculate CGPA <br/><span className="text-primary italic">with Intelligence.</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Select what information you have available, and we'll guide you through the rest.</p>
              </div>

              <div className="flex justify-center w-full max-w-sm mx-auto">

                {METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    className="w-full group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-card border border-border hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all text-center"
                  >
                    <div className="p-4 rounded-2xl bg-secondary group-hover:bg-primary/10 transition-colors">
                      <method.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl">{method.label}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
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
                  className="px-12 py-5 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
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
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold shadow-2xl shadow-primary/30 border border-primary/10 hover:scale-105 active:scale-95 transition-all"
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
              className="absolute bottom-16 left-0 w-80 bg-card/98 backdrop-blur-2xl border border-border p-6 rounded-[2rem] shadow-2xl"
            >
              <h3 className="text-xl font-black mb-4">Send Feedback</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-secondary rounded-xl">
                  <button
                    onClick={() => setFeedbackType('feedback')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                      feedbackType === 'feedback' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
                    )}
                  >
                    Feedback
                  </button>
                  <button
                    onClick={() => setFeedbackType('question')}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-md transition-all",
                      feedbackType === 'question' ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
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
      {/* NFSU Prompt */}
      <AnimatePresence>
        {showNFSUAsk && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100]"
          >
            <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center text-center gap-4 border border-blue-400/30">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <p className="font-black text-lg">Are you an NFSU student?</p>
                    <p className="text-white/80 text-xs">Switch to specialized NFSU mode for accurate calculations.</p>
                </div>
                <div className="flex gap-2 w-full mt-2">
                    <button 
                        onClick={() => {
                            updateGradingSystem('nfsu-10');
                            localStorage.setItem('is_nfsu', 'true');
                            localStorage.setItem('nfsu_asked', 'true');
                            setShowNFSUAsk(false);
                        }}
                        className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Yes, Switch
                    </button>
                    <button 
                        onClick={() => {
                            localStorage.setItem('nfsu_asked', 'true');
                            setShowNFSUAsk(false);
                        }}
                        className="px-4 py-3 bg-blue-700 text-white rounded-xl font-black text-sm hover:bg-blue-800 transition-all"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OCR Scanner Modal */}
      {isScanning && (
        <MarksScanner 
          onScanComplete={handleScanComplete}
          onClose={() => setIsScanning(false)}
        />
      )}
    </div>
  );
}
