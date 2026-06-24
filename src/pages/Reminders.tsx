import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { PageHeader } from '../components/dashboard/PageHeader';
import { ReminderCard } from '../components/dashboard/ReminderCard';
import { MedicineForm } from '../components/MedicineForm';
import { format, isAfter, parse } from 'date-fns';
import { CheckCircle } from 'lucide-react';

export default function Reminders() {
  const { user } = useAuth();
  const { medicines, markTaken, updateMedicine } = useMedicines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<any>(null);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const currentDayNameShort = useMemo(() => format(new Date(), 'E'), []);

  const getDoseLog = (medicine: any, timeSlot: string) => {
    return medicine.logs?.find((l: any) => l.date === todayStr && l.timeSlot === timeSlot);
  };

  const schedule = useMemo(() => {
    const todayMedicines = medicines.filter(med => {
      if (['daily', 'twice_daily', 'three_times_daily'].includes(med.schedule_type)) return true;
      if (['weekly', 'custom'].includes(med.schedule_type)) {
        if (!med.schedule_days) return false;
        return med.schedule_days.toLowerCase().includes(currentDayNameShort.toLowerCase());
      }
      return true;
    });

    const scheduleItems: { med: any, timeSlot: string, timeLabel: string, group: string }[] = [];
    
    todayMedicines.forEach(med => {
      if (med.schedule_type === 'three_times_daily') {
        scheduleItems.push({ med, timeSlot: 'Morning', timeLabel: '08:30 AM', group: 'Morning' });
        scheduleItems.push({ med, timeSlot: 'Afternoon', timeLabel: '02:00 PM', group: 'Afternoon' });
        scheduleItems.push({ med, timeSlot: 'Night', timeLabel: '08:00 PM', group: 'Night' });
      } else if (med.schedule_type === 'twice_daily') {
        scheduleItems.push({ med, timeSlot: 'Morning', timeLabel: '08:30 AM', group: 'Morning' });
        scheduleItems.push({ med, timeSlot: 'Night', timeLabel: '08:00 PM', group: 'Night' });
      } else {
        // Simple logic to place in morning if single dose
        scheduleItems.push({ med, timeSlot: 'Morning', timeLabel: '10:00 AM', group: 'Morning' });
      }
    });

    return scheduleItems.sort((a, b) => {
      const timeA = parse(a.timeLabel, 'hh:mm a', new Date()).getTime();
      const timeB = parse(b.timeLabel, 'hh:mm a', new Date()).getTime();
      return timeA - timeB;
    }).map(item => {
      const log = getDoseLog(item.med, item.timeSlot);
      let status = 'Upcoming';
      const itemTime = parse(item.timeLabel, 'hh:mm a', new Date());
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

  const groups = ['Morning', 'Afternoon', 'Evening', 'Night'];
  
  const completedCount = schedule.filter(s => s.status === 'Taken').length;
  const totalCount = schedule.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleMark = async (medId: string, timeSlot: string, status: 'taken' | 'missed') => {
    await markTaken(medId, timeSlot, status, todayStr);
  };

  const handleMarkAllTaken = async (group: string) => {
    const groupItems = schedule.filter(s => s.group === group && s.status !== 'Taken');
    for (const item of groupItems) {
      await markTaken(item.med.id, item.timeSlot, 'taken', todayStr);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      <Sidebar user={user} />
      
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen pb-10">
        <PageHeader 
          title="Reminders" 
          subtitle="Stay on track with your daily medication schedule." 
          user={user} 
        />
        
        <div className="px-8 flex flex-col gap-6">
          {/* Daily Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-[16px] font-extrabold text-slate-900">Daily Progress</h3>
                <p className="text-[13px] text-slate-500 font-medium">{completedCount} of {totalCount} reminders completed</p>
              </div>
              <span className="text-[20px] font-extrabold text-blue-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Groups */}
          <div className="space-y-6">
            {groups.map(group => {
              const groupSchedule = schedule.filter(s => s.group === group);
              if (groupSchedule.length === 0) return null;

              return (
                <div key={group} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[16px] font-extrabold text-slate-900">{group}</h3>
                    <button 
                      onClick={() => handleMarkAllTaken(group)}
                      className="flex items-center gap-1.5 text-blue-600 bg-[#EFF4FF] hover:bg-blue-100 px-4 py-2 rounded-xl text-[13px] font-bold transition-colors"
                    >
                      <CheckCircle size={16} /> Mark all taken
                    </button>
                  </div>
                  <div className="space-y-4">
                    {groupSchedule.map(item => (
                      <ReminderCard 
                        key={`${item.med.id}-${item.timeSlot}`}
                        item={item}
                        onMark={(status) => handleMark(item.med.id, item.timeSlot, status)}
                        onEdit={() => {
                          setMedicineToEdit(item.med);
                          setIsModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            {totalCount === 0 && (
               <div className="text-center py-10 text-slate-400 font-medium">
                 No reminders for today.
               </div>
            )}
          </div>
        </div>
      </main>

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
    </div>
  );
}
