import { Pill, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ReminderCardProps {
  item: any;
  onMark: (status: 'taken' | 'missed') => void;
  onEdit: () => void;
}

export function ReminderCard({ item, onMark, onEdit }: ReminderCardProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Taken': return 'bg-emerald-100 text-emerald-700';
      case 'Due Soon': return 'bg-orange-100 text-orange-700';
      case 'Missed': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-100 dark:hover:border-blue-900 transition-colors group">
      <div className="flex items-center gap-4 min-w-0 sm:w-5/12">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Pill size={20} />
        </div>
        <div className="min-w-0">
          <h4 className="font-extrabold text-[15px] text-slate-900 dark:text-white truncate">{item.med.medicine_name}</h4>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate flex items-center gap-1">
            <Clock size={12} /> {item.med.dosage}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between sm:justify-end sm:w-7/12 gap-4 w-full sm:w-auto">
        <div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${getStatusStyles(item.status)}`}>
            {item.status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[14px] font-extrabold text-slate-900 dark:text-white mr-2">{item.timeLabel}</span>
          
          {item.status === 'Taken' ? (
             <span className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-[12px] font-bold">
               <CheckCircle size={16} /> Taken
             </span>
          ) : item.status === 'Missed' ? (
             <span className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-xl text-[12px] font-bold">
               <XCircle size={16} /> Missed
             </span>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onMark('taken')} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold transition-colors shadow-sm flex items-center gap-1"
              >
                Take
              </button>
              <button 
                onClick={() => onMark('missed')} 
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[12px] font-bold transition-colors"
              >
                Skip
              </button>
              <button 
                onClick={onEdit} 
                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-850 rounded-xl transition-colors ml-1"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
