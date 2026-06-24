import { UploadCloud } from 'lucide-react';

interface UploadPrescriptionCardProps {
  onClick: () => void;
}

export function UploadPrescriptionCard({ onClick }: UploadPrescriptionCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-8 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group h-full min-h-[240px]"
    >
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <UploadCloud size={32} />
      </div>
      <h3 className="text-[16px] font-extrabold text-slate-900 mb-2">Upload Prescription</h3>
      <p className="text-[13px] text-slate-500 font-medium text-center max-w-[200px]">
        Drag & drop your prescription here, or click to browse files
      </p>
      <div className="mt-6">
        <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-sm group-hover:bg-blue-700 transition-colors inline-block">
          Select File
        </span>
      </div>
    </div>
  );
}
