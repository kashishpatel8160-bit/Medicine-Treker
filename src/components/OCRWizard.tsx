import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Loader2, FileImage, CheckSquare, Square, X } from 'lucide-react';

interface OCRWizardProps {
  onConfirm: (medicineNames: string[]) => void;
  onClose: () => void;
}

export function OCRWizard({ onConfirm, onClose }: OCRWizardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedLines, setExtractedLines] = useState<{ text: string; selected: boolean; id: string }[]>([]);
  const [step, setStep] = useState<'upload' | 'select'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        }
      });
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 3)
        .map((l, i) => ({ text: l, selected: false, id: `line-${i}` }));
        
      setExtractedLines(lines);
      setStep('select');
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to extract text from image. Please try again.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleLine = (id: string) => {
    setExtractedLines(prev => prev.map(l => l.id === id ? { ...l, selected: !l.selected } : l));
  };

  const handleTextChange = (id: string, newText: string) => {
    setExtractedLines(prev => prev.map(l => l.id === id ? { ...l, text: newText } : l));
  };

  const handleConfirm = () => {
    const selectedNames = extractedLines.filter(l => l.selected && l.text.trim().length > 0).map(l => l.text.trim());
    onConfirm(selectedNames);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Scan Prescription</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="text-center">
              <input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                    <span className="text-sm font-medium text-indigo-700">Analyzing Prescription... {progress}%</span>
                  </>
                ) : (
                  <>
                    <FileImage className="text-indigo-500 mb-4" size={32} />
                    <span className="text-base font-bold text-indigo-700 mb-1">Upload Prescription Image</span>
                    <span className="text-xs text-indigo-500 max-w-xs mx-auto">We will automatically detect medicine names using AI OCR.</span>
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Please select the detected lines that represent medicine names, and edit them if there are typos.
              </p>
              
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 max-h-[300px] overflow-y-auto bg-slate-50">
                {extractedLines.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-4">No text detected. Try another image.</p>
                ) : (
                  extractedLines.map(line => (
                    <div key={line.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => toggleLine(line.id)} className="text-indigo-600 shrink-0">
                        {line.selected ? <CheckSquare size={20} /> : <Square size={20} className="text-slate-300" />}
                      </button>
                      <input 
                        type="text" 
                        value={line.text} 
                        onChange={(e) => handleTextChange(line.id, e.target.value)}
                        className="flex-1 text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-slate-800 font-medium"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {step === 'select' && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button onClick={() => setStep('upload')} className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Retry Image
            </button>
            <button 
              onClick={handleConfirm}
              disabled={extractedLines.filter(l => l.selected).length === 0}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              Continue with {extractedLines.filter(l => l.selected).length} Selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
