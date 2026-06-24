import { FileText, Download, Eye, Calendar, User } from 'lucide-react';

interface PrescriptionCardProps {
  prescription: any;
  onView: () => void;
}

export function PrescriptionCard({ prescription, onView }: PrescriptionCardProps) {
  const isExpired = prescription.status === 'Expired';
  const isRenewSoon = prescription.status === 'Renew Soon';
  
  const getBadgeStyles = () => {
    if (isExpired) return 'bg-red-50 text-red-600';
    if (isRenewSoon) return 'bg-orange-50 text-orange-600';
    return 'bg-emerald-50 text-emerald-600';
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col hover:border-blue-100 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            prescription.fileType === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
          }`}>
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 leading-tight">{prescription.medicine_name || 'Prescription'}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
               <User size={12} /> {prescription.doctorName || 'Dr. Unknown'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-3 mt-2">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar size={14}/> Issue Date</span>
          <span className="font-extrabold text-slate-900">{prescription.issueDate || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 font-medium flex items-center gap-1"><Calendar size={14}/> Expiry Date</span>
          <span className={`font-extrabold ${isExpired ? 'text-red-500' : 'text-slate-900'}`}>
            {prescription.expiryDate || 'N/A'}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${getBadgeStyles()}`}>
          {prescription.status || 'Active'}
        </span>
        
        <div className="flex gap-2">
           <button onClick={onView} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors" title="View">
             <Eye size={16} />
           </button>
           <button className="p-2 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors" title="Download">
             <Download size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}
