import { Flame, Pill, Clock, Check, ChevronRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RightSidebarWidgetsProps {
  upcomingReminders: any[];
  lowStockMedicines: any[];
  onRestock: (id: string, qty: number) => Promise<void>;
}

export function RightSidebarWidgets({ upcomingReminders, lowStockMedicines, onRestock }: RightSidebarWidgetsProps) {
  return (
    <div className="w-full lg:w-[340px] shrink-0 space-y-6">
      {/* Low Stock Alerts */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertTriangle size={20} className="animate-bounce-short" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px]">Low Stock Alerts</h3>
          </div>
          
          <div className="space-y-3">
            {lowStockMedicines.map(med => (
              <div key={med.id} className="flex flex-col gap-3 p-4 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-[13px] truncate">{med.medicine_name}</h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                      Remaining: {med.remaining_quantity} tablets
                    </p>
                  </div>
                  <span className="shrink-0 text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-850 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Low Stock
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const qty = window.prompt(`Enter tablet count to add to stock for ${med.medicine_name}:`);
                    if (qty) {
                      const num = parseInt(qty, 10);
                      if (!isNaN(num) && num > 0) {
                        await onRestock(med.id, num);
                      }
                    }
                  }}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="text-orange-500" size={20} />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px]">Streak</h3>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[40px] font-extrabold text-slate-900 dark:text-white leading-none">7</span>
              <span className="text-[14px] font-extrabold text-blue-600 dark:text-blue-450">Days</span>
            </div>
            <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 mt-1">Keep it up! 🎉</p>
          </div>
          
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="40" className="stroke-blue-600" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <Pill size={24} />
            </div>
          </div>
        </div>

        {/* Week Days */}
        <div className="flex justify-between px-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <span className="text-[11px] font-extrabold text-blue-650 dark:text-blue-400">{day}</span>
              {i < 6 ? (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Check size={12} strokeWidth={3.5} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-850 border-2 border-slate-100 dark:border-slate-850"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-[15px]">Upcoming Reminders</h3>
          <Link to="/dashboard/reminders" className="text-blue-600 dark:text-blue-450 text-[12px] font-bold hover:underline">View all</Link>
        </div>
        
        <div className="space-y-3">
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-4 text-[13px] text-slate-400 dark:text-slate-505 font-medium">No upcoming reminders</div>
          ) : (
            upcomingReminders.slice(0, 3).map((item, index) => (
              <div key={`rem-${index}`} className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-slate-950/20 rounded-2xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-450 flex items-center justify-center shadow-sm shrink-0">
                    <Clock size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-[13px] truncate">{item.med.medicine_name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5 font-medium truncate">{item.med.dosage}</p>
                  </div>
                </div>
                <span className="text-[12px] font-extrabold text-blue-650 dark:text-blue-400 shrink-0">{item.timeLabel}</span>
              </div>
            ))
          )}
        </div>

        <Link 
          to="/dashboard/reminders"
          className="w-full mt-5 py-3.5 bg-[#EFF4FF] dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 rounded-2xl text-[13px] font-bold hover:bg-blue-105 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-center gap-1.5"
        >
          View all reminders <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
