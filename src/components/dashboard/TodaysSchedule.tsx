import { Calendar, CheckCircle, Pill } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleItem {
  med: any;
  timeSlot: string;
  timeLabel: string;
  status: string;
  log?: any;
}

interface TodaysScheduleProps {
  schedule: ScheduleItem[];
  onMarkSlotTaken: (slot: string) => Promise<void>;
}

export function TodaysSchedule({ schedule, onMarkSlotTaken }: TodaysScheduleProps) {
  const slots = ['Morning', 'Afternoon', 'Night'];

  // Helper to check the overall slot status
  const getSlotSummary = (items: ScheduleItem[]) => {
    if (items.length === 0) return { label: 'No medicines', style: 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800' };
    const takenCount = items.filter(i => i.status === 'Taken').length;
    const missedCount = items.filter(i => i.status === 'Missed').length;
    
    if (takenCount === items.length) {
      return { label: 'Completed', style: 'text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20' };
    }
    if (missedCount > 0) {
      return { label: `${missedCount} Missed`, style: 'text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20' };
    }
    return { label: `${items.length - takenCount} Pending`, style: 'text-blue-700 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/20' };
  };

  const getDoseStatusDot = (status: string) => {
    switch (status) {
      case 'Taken':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Taken" />;
      case 'Missed':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500" title="Missed" />;
      case 'Due Soon':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Due Soon" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" title="Upcoming" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white">Today's Schedule</h2>
            <p className="text-[11px] text-slate-400 font-semibold">{format(new Date(), 'eeee, dd MMM yyyy')}</p>
          </div>
        </div>
      </div>

      {/* Slots List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {slots.map(slot => {
          const items = schedule.filter(item => item.timeSlot === slot);
          const summary = getSlotSummary(items);
          const allTaken = items.length > 0 && items.every(item => item.status === 'Taken');
          
          // Get the timing label from items, or default
          const timeLabel = items.length > 0 ? items[0].timeLabel : (
            slot === 'Morning' ? '08:30 AM' : slot === 'Afternoon' ? '02:00 PM' : '08:00 PM'
          );

          return (
            <div key={slot} className="flex flex-col bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 hover:border-blue-100 dark:hover:border-blue-950 transition-colors">
              {/* Slot Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-905 dark:text-white flex items-center gap-1.5">
                    {slot}
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">({timeLabel})</span>
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${summary.style}`}>
                  {summary.label}
                </span>
              </div>

              {/* Medicines in Slot */}
              <div className="flex-1 space-y-2.5 mb-5">
                {items.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    No medicines scheduled
                  </div>
                ) : (
                  items.map(item => (
                    <div key={`${item.med.id}-${item.timeSlot}`} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-slate-900 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Pill size={14} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate leading-tight">
                            {item.med.medicine_name}
                          </h4>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium mt-0.5">
                            {item.med.dosage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center shrink-0">
                        {getDoseStatusDot(item.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Group Action Button */}
              {items.length > 0 && (
                <button
                  onClick={() => !allTaken && onMarkSlotTaken(slot)}
                  disabled={allTaken}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${
                    allTaken
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-150 cursor-default shadow-none'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  {allTaken ? (
                    <>
                      <CheckCircle size={14} /> Taken
                    </>
                  ) : (
                    `Taken All ${slot} Medicines`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
