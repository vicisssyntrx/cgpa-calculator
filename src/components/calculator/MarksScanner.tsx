'use client';

import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Upload, X, Loader2, Camera, Check, AlertCircle } from 'lucide-react';
import { Subject } from '@/types/calculator';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface MarksScannerProps {
  onScanComplete: (subjects: Subject[]) => void;
  onClose: () => void;
}

export function MarksScanner({ onScanComplete, onClose }: MarksScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      // Basic parsing logic (very rudimentary, would need refinement for different formats)
      const lines = text.split('\n');
      const detectedSubjects: Subject[] = [];
      
      lines.forEach(line => {
        // Look for patterns like "Subject Name 85 100" or "Subject Name A+"
        // This is a placeholder parsing logic
        const marksMatch = line.match(/(.+?)\s+(\d+)\s+(\d+)/);
        if (marksMatch) {
          detectedSubjects.push({
            id: Math.random().toString(36).substr(2, 9),
            name: marksMatch[1].trim(),
            credits: 4, // Default credits
            marks: parseInt(marksMatch[2]),
            maxMarks: parseInt(marksMatch[3])
          });
        }
      });

      if (detectedSubjects.length === 0) {
        // Fallback: If no marks found, just show the text and ask user to input manually
        // or try another parsing method
        setError("Could not automatically detect subjects. Please try a clearer image or input manually.");
      } else {
        onScanComplete(detectedSubjects);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError("Failed to process image. Make sure it's a clear photo of your marksheet.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Camera className="w-6 h-6 text-primary" />
            Scan Marksheet
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="p-4 rounded-2xl bg-secondary group-hover:bg-primary/10 transition-colors text-primary">
                <Upload className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">Click to Upload Marksheet</p>
                <p className="text-sm text-muted-foreground">Supports PNG, JPG (Max 5MB)</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black/5">
                <img src={image} alt="Marksheet preview" className="w-full h-full object-contain" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isProcessing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing Image...
                    </span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground italic">
                    Our AI is reading your marksheet. This usually takes 5-10 seconds.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-medium">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                  )}
                  <button 
                    onClick={processImage}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Start Extraction
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-secondary/50 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Tip: For best results, ensure the image is well-lit and the text is clearly visible.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
