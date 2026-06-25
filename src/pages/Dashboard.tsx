import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { Medicine } from '../types';
import { format, isAfter, parse } from 'date-fns';

import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { StatCards } from '../components/dashboard/StatCards';
import { TodaysSchedule } from '../components/dashboard/TodaysSchedule';
import { RightSidebarWidgets } from '../components/dashboard/RightSidebarWidgets';
import { RecentAndQuickActions } from '../components/dashboard/RecentAndQuickActions';

// Existing Features
import { OCRWizard } from '../components/OCRWizard';
import { MultiMedicineForm } from '../components/MultiMedicineForm';

export default function Dashboard() {
  const { user } = useAuth();
  const { medicines, markTaken, addMedicine, updateMedicine } = useMedicines();
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
      // Check start/end date range
      if (med.start_date && todayStr < med.start_date) return false;
      if (med.end_date && todayStr > med.end_date) return false;

      if (['daily', 'twice_daily', 'three_times_daily'].includes(med.schedule_type)) return true;
      if (['weekly', 'custom'].includes(med.schedule_type)) {
        if (!med.schedule_days) return false;
        return med.schedule_days.toLowerCase().includes(currentDayNameShort.toLowerCase());
      }
      return true;
    });
  }, [medicines, todayStr, currentDayNameShort]);

  // Derived Stats
  const totalMedicinesCount = medicines.length;

  const lowStockCount = useMemo(() => {
    return medicines.filter(med => med.remaining_quantity < 10 || med.remaining_quantity <= med.low_stock_threshold).length;
  }, [medicines]);

  const getDoseLog = (medicine: Medicine, timeSlot: string) => {
    return medicine.logs?.find(l => l.date === todayStr && l.timeSlot === timeSlot);
  };

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

  // Build the flat schedule list for today
  const todaySchedule = useMemo(() => {
    const scheduleItems: { med: Medicine, timeSlot: string, timeLabel: string }[] = [];
    
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
          scheduleItems.push({ med, timeSlot: match[1], timeLabel: match[2] });
        } else {
          scheduleItems.push({ med, timeSlot: trimmed, timeLabel: defaultTimes[trimmed] || '08:00 AM' });
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
  }, [todayMedicines, todayStr, medicines]);

  const takenTodayCount = useMemo(() => {
    return todaySchedule.filter(item => item.status === 'Taken').length;
  }, [todaySchedule]);

  const missedTodayCount = useMemo(() => {
    return todaySchedule.filter(item => item.status === 'Missed').length;
  }, [todaySchedule]);

  const upcomingReminders = todaySchedule.filter(item => item.status === 'Upcoming' || item.status === 'Due Soon');

  // Actions
  const handleMarkSlotTaken = async (slot: string) => {
    const slotItems = todaySchedule.filter(item => item.timeSlot === slot && item.status !== 'Taken');
    try {
      for (const item of slotItems) {
        await markTaken(item.med.id, item.timeSlot, 'taken', todayStr);
      }
    } catch (err) {
      console.error(`Failed to mark all ${slot} taken`, err);
    }
  };
  const lowStockMedicines = useMemo(() => {
    return medicines.filter(med => med.remaining_quantity < 10 || med.remaining_quantity <= med.low_stock_threshold);
  }, [medicines]);

  const handleRestock = async (id: string, qty: number) => {
    const med = medicines.find(m => m.id === id);
    if (med) {
      await updateMedicine(id, {
        quantity: med.quantity + qty,
        remaining_quantity: med.remaining_quantity + qty
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Welcome Banner */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] || 'Amit'} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Here's your medicine overview for today.</p>
        </div>
        
        {/* Responsive Flex Containers */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column Area */}
          <div className="flex-1 flex flex-col gap-6">
            <StatCards 
              totalMedicines={totalMedicinesCount}
              takenToday={takenTodayCount}
              missedToday={missedTodayCount}
              lowStock={lowStockCount}
            />
            
            <TodaysSchedule 
              schedule={todaySchedule}
              onMarkSlotTaken={handleMarkSlotTaken}
            />
            
            <RecentAndQuickActions 
              recentMedicines={medicines}
              onUploadPrescription={() => setIsOcrWizardOpen(true)}
            />
          </div>

          {/* Right Column Area */}
          <RightSidebarWidgets 
            upcomingReminders={upcomingReminders} 
            lowStockMedicines={lowStockMedicines}
            onRestock={handleRestock}
          />
        </div>
      </div>

      {/* OCR Wizards */}
      {isOcrWizardOpen && (
        <OCWizardFlow 
          onClose={() => setIsOcrWizardOpen(false)}
          onConfirm={(names: string[]) => {
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
    </DashboardLayout>
  );
}

// Wrapper to prevent naming conflict inside JSX
function OCWizardFlow({ onClose, onConfirm }: any) {
  return <OCRWizard onClose={onClose} onConfirm={onConfirm} />;
}
