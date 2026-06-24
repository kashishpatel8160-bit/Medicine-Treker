import { Calendar, CheckCircle, MoreVertical, Pill, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ScheduleItem {
  med: any;
  timeSlot: string;
  timeLabel: string;
  status: string;
  log?: any;
}

interface TodaysScheduleProps {
  schedule: ScheduleItem[];
  onMarkAllTaken: () => void;
  onToggleIndividual: (med: any, timeSlot: string, logId?: string) => void;
}

export function TodaysSchedule({ schedule, onMarkAllTaken, onToggleIndividual }: TodaysScheduleProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Taken': return 'bg-emerald-100 text-emerald-700';
      case 'Due Soon': return 'bg-orange-100 text-orange-700';
      case 'Missed': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getIconStyles = (index: number) => {
    const styles = [
      'bg-blue-100 text-blue-600',
      'bg-orange-100 text-orange-500',
      'bg-purple-100 text-purple-600',
      'bg-emerald-100 text-emerald-600'
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-600" size={22} />
          <h2 className="text-[16px] font-extrabold text-slate-900">Today's Schedule</h2>
          <span className="text-[13px] font-bold text-blue-600 ml-2">{format(new Date(), 'dd MMM yyyy')}</span>
        </div>
        <button 
          onClick={onMarkAllTaken}
          className="flex items-center gap-1.5 text-blue-600 bg-[#EFF4FF] hover:bg-blue-100 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors"
        >
          <CheckCircle size={16} /> Mark all as taken
        </button>
      </div>

      <div className="flex-1 space-y-0">
        {schedule.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-medium">No medicines scheduled for today.</div>
        ) : (
          schedule.map((item, index) => (
            <div key={`${item.med.id}-${item.timeSlot}`} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-4 w-5/12">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getIconStyles(index)}`}>
                  <Pill size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-[14px] truncate">{item.med.medicine_name}</h4>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5 truncate">{item.med.dosage} • After {item.timeSlot}</p>
                </div>
              </div>
              
              <div className="w-3/12 flex justify-center">
                <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${getStatusStyles(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className="w-4/12 flex justify-end items-center gap-6">
                <span className="text-[14px] font-extrabold text-slate-900 whitespace-nowrap">{item.timeLabel}</span>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50">
        <Link to="/dashboard/medicine-tracker" className="text-blue-600 text-[13px] font-bold flex items-center gap-1 hover:underline w-max">
          View full schedule <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
