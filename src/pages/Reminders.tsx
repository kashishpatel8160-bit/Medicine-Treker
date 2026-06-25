import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PageHeader } from '../components/dashboard/PageHeader';
import { MedicineForm } from '../components/MedicineForm';
import { format, isAfter, parse } from 'date-fns';
import { CheckCircle, AlertTriangle, Pill, Clock, ArrowRight } from 'lucide-react';

export default function Reminders() {
  const { user } = useAuth();
  const { medicines, markTaken, updateMedicine } = useMedicines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<any>(null);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const currentDayNameShort = useMemo(() => format(new Date(), 'E'), []);

  const parseSlotTime = (timeStr: string) => {
    const now = new Date();
    const dateStr = format(now, 'yyyy-MM-dd');
    try {
      if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
        return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd hh:mm a', new Date());
      } else {
        return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
      }
    } catch (e) {
      return now;
    }
  };

  const getDoseLog = (medicine: any, timeSlot: string) => {
    return medicine.logs?.find((l: any) => l.date === todayStr && l.timeSlot === timeSlot);
  };

  // Build schedule
  const schedule = useMemo(() => {
    const todayMedicines = medicines.filter(med => {
      if (med.start_date && todayStr < med.start_date) return false;
      if (med.end_date && todayStr > med.end_date) return false;

      if (['daily', 'twice_daily', 'three_times_daily'].includes(med.schedule_type)) return true;
      if (['weekly', 'custom'].includes(med.schedule_type)) {
        if (!med.schedule_days) return false;
        return med.schedule_days.toLowerCase().includes(currentDayNameShort.toLowerCase());
      }
      return true;
    });

    const scheduleItems: { med: any, timeSlot: string, timeLabel: string, group: string }[] = [];
    
    todayMedicines.forEach(med => {
      const freq = med.frequency || 'Morning, Afternoon, Night';
      const parts = freq.split(',');
      const defaultTimes: Record<string, string> = {
        Morning: '08:30 AM',
        Afternoon: '02:00 PM',
        Night: '08:00 PM'
      };

      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        
        const match = trimmed.match(/^([A-Za-z]+)\s*\(([^)]+)\)$/);
        if (match) {
          scheduleItems.push({ med, timeSlot: match[1], timeLabel: match[2], group: match[1] });
        } else {
          scheduleItems.push({ med, timeSlot: trimmed, timeLabel: defaultTimes[trimmed] || '08:00 AM', group: trimmed });
        }
      });
    });

    return scheduleItems.sort((a, b) => {
      const timeA = parseSlotTime(a.timeLabel).getTime();
      const timeB = parseSlotTime(b.timeLabel).getTime();
      return timeA - timeB;
    }).map(item => {
      const log = getDoseLog(item.med, item.timeSlot);
      let status = 'Upcoming';
      const itemTime = parseSlotTime(item.timeLabel);
      const now = new Date();
      
      if (log?.status === 'taken') {
        status = 'Taken';
      } else if (log?.status === 'missed') {
        status = 'Missed';
      } else if (isAfter(now, itemTime)) {
        status = 'Missed';
      } else if (isAfter(now, new Date(itemTime.getTime() - 60 * 60 * 1000))) {
        status = 'Due Soon';
      }

      return { ...item, status, log };
    });
  }, [medicines, todayStr, currentDayNameShort]);

  const groups = ['Morning', 'Afternoon', 'Night'];
  
  const completedCount = schedule.filter(s => s.status === 'Taken').length;
  const totalCount = schedule.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Group level Action
  const handleMarkAllTaken = async (group: string) => {
    const groupItems = schedule.filter(s => s.group === group && s.status !== 'Taken');
    for (const item of groupItems) {
      await markTaken(item.med.id, item.timeSlot, 'taken', todayStr);
    }
  };

  // Determine missed dose warnings
  const missedDoses = useMemo(() => {
    return schedule.filter(item => item.status === 'Missed');
  }, [schedule]);

  // Determine next upcoming dose group
  const nextDoseGroup = useMemo(() => {
    const upcoming = schedule.filter(item => item.status === 'Upcoming' || item.status === 'Due Soon');
    if (upcoming.length === 0) return null;
    
    // Sort upcoming by timing, group by timeSlot
    const nextItem = upcoming[0];
    const groupName = nextItem.group;
    const groupItems = upcoming.filter(item => item.group === groupName);
    
    return {
      name: groupName,
      time: nextItem.timeLabel,
      medicines: groupItems.map(i => i.med.medicine_name)
    };
  }, [schedule]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Taken': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Due Soon': return 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400';
      case 'Missed': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450';
      default: return 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Reminders" 
        subtitle="Stay on track with your daily medication schedule." 
        user={user} 
      />
      
      <div className="flex flex-col gap-6">
        {/* Missed Dose Warnings */}
        {missedDoses.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 rounded-2xl p-5 flex items-start gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-extrabold text-rose-800 dark:text-rose-400">⚠️ Missed Dose Warning</h3>
              <p className="text-xs text-rose-700 dark:text-rose-350 font-semibold mt-1">
                You have missed {missedDoses.length} scheduled medication{missedDoses.length > 1 ? 's' : ''} today. Please check your schedule and record them.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missedDoses.map(item => (
                  <span key={`${item.med.id}-${item.timeSlot}`} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-[10px] font-bold">
                    {item.med.medicine_name} ({item.group})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Dose Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white">Daily Progress</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold mt-1">{completedCount} of {totalCount} reminders completed</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-slate-400">Completion</span>
                <span className="text-[16px] font-extrabold text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Next Dose Display */}
          {nextDoseGroup ? (
            <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-650 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 bg-white/20 text-[10px] font-bold rounded-lg tracking-wider uppercase">
                  Upcoming Medicine Time
                </span>
                <h3 className="text-[20px] font-extrabold mt-3 flex items-center gap-2">
                  <Clock size={20} /> Next Dose: {nextDoseGroup.name}
                  <span className="text-sm font-semibold opacity-90">at {nextDoseGroup.time}</span>
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  {nextDoseGroup.medicines.map((name, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/10 text-white rounded-lg text-xs font-bold">
                      {name}
                    </span>
                  ))}
                </div>
                <ArrowRight size={18} className="opacity-80 shrink-0" />
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-455 text-sm font-bold">
              🎉 No upcoming doses left for today! All done.
            </div>
          )}
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {groups.map(group => {
            const groupSchedule = schedule.filter(s => s.group === group);
            if (groupSchedule.length === 0) return null;

            const allTaken = groupSchedule.every(s => s.status === 'Taken');
            const groupTime = groupSchedule[0]?.timeLabel || '08:00 AM';

            return (
              <div key={group} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-5">
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-50 dark:border-slate-850 pb-4">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-slate-905 dark:text-white flex items-center gap-2">
                      {group} Schedule
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-550">({groupTime})</span>
                    </h3>
                  </div>
                  <button 
                    onClick={() => !allTaken && handleMarkAllTaken(group)}
                    disabled={allTaken}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm ${
                      allTaken
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-150 cursor-default shadow-none'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow active:scale-[0.98]'
                    }`}
                  >
                    <CheckCircle size={16} /> {allTaken ? 'Taken' : `Taken All ${group} Medicines`}
                  </button>
                </div>

                {/* Medicine List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupSchedule.map(item => (
                    <div 
                      key={`${item.med.id}-${item.timeSlot}`}
                      className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4 hover:border-blue-100 dark:hover:border-blue-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Pill size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{item.med.medicine_name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">{item.med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusStyles(item.status)}`}>
                          {item.status}
                        </span>
                        <button
                          onClick={() => {
                            setMedicineToEdit(item.med);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Medicine"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {totalCount === 0 && (
             <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 text-slate-400 font-medium">
               No reminders scheduled for today.
             </div>
          )}
        </div>
      </div>

      <MedicineForm
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={async (medData) => {
          if (medicineToEdit) {
            await updateMedicine(medicineToEdit.id, medData);
          }
          setIsModalOpen(false);
        }}
        editMedicine={medicineToEdit} 
      />
    </DashboardLayout>
  );
}
