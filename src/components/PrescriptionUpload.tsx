import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Loader2, FileImage } from 'lucide-react';

interface PrescriptionUploadProps {
  onExtractedText: (text: string) => void;
}

export function PrescriptionUpload({ onExtractedText }: PrescriptionUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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
      
      onExtractedText(text);
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

  return (
    <div className="w-full mb-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={fileInputRef}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin text-indigo-500 mb-2" size={24} />
            <span className="text-sm font-medium text-indigo-700">Extracting Text... {progress}%</span>
          </>
        ) : (
          <>
            <FileImage className="text-indigo-500 mb-2" size={24} />
            <span className="text-sm font-medium text-indigo-700">Upload Prescription for Auto-fill</span>
            <span className="text-xs text-indigo-400 mt-1">Uses OCR to detect medicine names</span>
          </>
        )}
      </button>
    </div>
  );
}
