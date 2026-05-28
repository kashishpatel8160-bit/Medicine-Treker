import React from 'react';
import { Medicine, Language, TranslationDict } from '../types';
import { Pill, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DashboardStatsProps {
  medicines: Medicine[];
  language: Language;
  t: TranslationDict;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ medicines, t }) => {
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format

  // Math calculations
  const totalCount = medicines.length;

  let lowStockCount = 0;
  let completedCount = 0;
  let todayPendingCount = 0;

  medicines.forEach((med) => {
    const dailyUsage = med.schedule.length * med.dosagePerTime;
    const daysRemaining = dailyUsage > 0 ? Math.floor(med.currentStock / dailyUsage) : Infinity;

    if (med.currentStock === 0) {
      completedCount++;
    } else if (daysRemaining <= 10) {
      lowStockCount++;
    }

    // Pending doses today
    // Filter logs for today
    const todayLogs = med.logs.filter((log) => log.date === todayStr);
    const pendingForThisMed = Math.max(0, med.schedule.length - todayLogs.length);
    if (med.currentStock > 0) {
      todayPendingCount += pendingForThisMed;
    }
  });

  const cards = [
    {
      title: t.totalMedicines,
      value: totalCount,
      icon: Pill,
      color: 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700',
      textColor: 'text-blue-500 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/30',
      description: 'Total active prescriptions'
    },
    {
      title: t.lowStockAlerts,
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700',
      textColor: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/30',
      description: 'Needs refill soon'
    },
    {
      title: t.completedCourses,
      value: completedCount,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
      description: 'Courses finished / 0 stock'
    },
    {
      title: t.pendingDosesToday,
      value: todayPendingCount,
      icon: Clock,
      color: 'from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700',
      textColor: 'text-purple-500 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-950/30',
      description: todayPendingCount === 0 ? t.noPendingDoses : 'Doses remaining for today'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-6 lg:mb-8 animate-slide-up">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 lg:p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group"
          >
            {/* Background highlight pill */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 dark:opacity-20 bg-gradient-to-tr ${card.color} transition-transform duration-500 group-hover:scale-125`} />
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgLight} ${card.textColor}`}>
                <Icon size={18} className="lg:w-5 lg:h-5" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
            </div>
            
            <p className="text-[10px] lg:text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
