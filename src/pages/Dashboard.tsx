import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { Medicine } from '../types';
import { format, isAfter, parse } from 'date-fns';

// Components
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { StatCards } from '../components/dashboard/StatCards';
import { TodaysSchedule } from '../components/dashboard/TodaysSchedule';
import { RightSidebarWidgets } from '../components/dashboard/RightSidebarWidgets';
import { RecentAndQuickActions } from '../components/dashboard/RecentAndQuickActions';

// Existing Features
import { OCRWizard } from '../components/OCRWizard';
import { MultiMedicineForm } from '../components/MultiMedicineForm';

export default function Dashboard() {
  const { user } = useAuth();
  const { medicines, markTaken, removeDoseLog, addMedicine } = useMedicines();
  const [greeting, setGreeting] = useState('');

  // OCR Wizard states
  const [isOcrWizardOpen, setIsOcrWizardOpen] = useState(false);
  const [isMultiFormOpen, setIsMultiFormOpen] = useState(false);
  const [ocrExtractedNames, setOcrExtractedNames] = useState<string[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const currentDayNameShort = useMemo(() => format(new Date(), 'E'), []);

  // Filter medicines meant for today based on schedule_type
  const todayMedicines = useMemo(() => {
    return medicines.filter(med => {
      if (['daily', 'twice_daily', 'three_times_daily'].includes(med.schedule_type)) return true;
      if (['weekly', 'custom'].includes(med.schedule_type)) {
        if (!med.schedule_days) return false;
        return med.schedule_days.toLowerCase().includes(currentDayNameShort.toLowerCase());
      }
      return true;
    });
  }, [medicines, currentDayNameShort]);

  // Derived Stats
  const totalMedicinesCount = medicines.length;

  const takenTodayCount = useMemo(() => {
    return medicines.reduce((acc, med) => {
      const logs = med.logs?.filter(l => l.date === todayStr && l.status === 'taken') || [];
      return acc + logs.length;
    }, 0);
  }, [medicines, todayStr]);

  const missedTodayCount = useMemo(() => {
    return medicines.reduce((acc, med) => {
      const logs = med.logs?.filter(l => l.date === todayStr && l.status === 'missed') || [];
      return acc + logs.length;
    }, 0);
  }, [medicines, todayStr]);

  const getDoseLog = (medicine: Medicine, timeSlot: string) => {
    return medicine.logs?.find(l => l.date === todayStr && l.timeSlot === timeSlot);
  };

  // Build the flat schedule list for today
  const todaySchedule = useMemo(() => {
    const scheduleItems: { med: Medicine, timeSlot: string, timeLabel: string }[] = [];
    todayMedicines.forEach(med => {
      if (med.schedule_type === 'three_times_daily') {
        scheduleItems.push({ med, timeSlot: 'Morning', timeLabel: '08:30 AM' });
        scheduleItems.push({ med, timeSlot: 'Afternoon', timeLabel: '02:00 PM' });
        scheduleItems.push({ med, timeSlot: 'Night', timeLabel: '08:00 PM' });
      } else if (med.schedule_type === 'twice_daily') {
        scheduleItems.push({ med, timeSlot: 'Morning', timeLabel: '08:30 AM' });
        scheduleItems.push({ med, timeSlot: 'Night', timeLabel: '08:00 PM' });
      } else {
        scheduleItems.push({ med, timeSlot: 'Morning', timeLabel: '10:00 AM' });
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
  }, [todayMedicines, todayStr, medicines]);

  const dueTodayCount = todaySchedule.length;
  const upcomingReminders = todaySchedule.filter(item => item.status === 'Upcoming' || item.status === 'Due Soon');

  // Actions
  const handleToggleIndividual = async (medicine: Medicine, timeSlot: string, logId?: string) => {
    try {
      if (logId) {
        await removeDoseLog(medicine.id, logId);
      } else {
        await markTaken(medicine.id, timeSlot, 'taken', todayStr);
      }
    } catch (err) {
      console.error('Failed to toggle dose', err);
    }
  };

  const handleMarkAllTaken = async () => {
    try {
      for (const item of todaySchedule) {
        if (item.status !== 'Taken') {
          await markTaken(item.med.id, item.timeSlot, 'taken', todayStr);
        }
      }
    } catch (err) {
      console.error('Failed to mark all taken', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      <Sidebar user={user} />
      
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen">
        <Header user={user} greeting={greeting} />
        
        <div className="px-8 pb-10 flex gap-6">
          {/* Left Column Area */}
          <div className="flex-1 flex flex-col gap-6">
            <StatCards 
              totalMedicines={totalMedicinesCount}
              dueToday={dueTodayCount}
              missed={missedTodayCount}
              completed={takenTodayCount}
            />
            
            <TodaysSchedule 
              schedule={todaySchedule}
              onMarkAllTaken={handleMarkAllTaken}
              onToggleIndividual={handleToggleIndividual}
            />
            
            <RecentAndQuickActions 
              recentMedicines={medicines}
              onUploadPrescription={() => setIsOcrWizardOpen(true)}
            />
          </div>

          {/* Right Column Area */}
          <RightSidebarWidgets upcomingReminders={upcomingReminders} />
        </div>
      </main>

      {/* OCR Wizards */}
      {isOcrWizardOpen && (
        <OCWizardFlow 
          onClose={() => setIsOcrWizardOpen(false)}
          onConfirm={(names) => {
            setOcrExtractedNames(names);
            setIsOcrWizardOpen(false);
            setIsMultiFormOpen(true);
          }}
        />
      )}

      {isMultiFormOpen && (
        <MultiMedicineForm
          initialNames={ocrExtractedNames}
          onClose={() => {
            setIsMultiFormOpen(false);
            setOcrExtractedNames([]);
          }}
          onSaveAll={async (medicinesList) => {
            for (const med of medicinesList) {
              await addMedicine(med);
            }
            setIsMultiFormOpen(false);
            setOcrExtractedNames([]);
          }}
        />
      )}
    </div>
  );
}

// Wrapper to prevent naming conflict inside JSX
function OCWizardFlow({ onClose, onConfirm }: any) {
  return <OCRWizard onClose={onClose} onConfirm={onConfirm} />;
}
