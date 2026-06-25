import { Flame, Pill, Clock, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RightSidebarWidgetsProps {
  upcomingReminders: any[];
}

export function RightSidebarWidgets({ upcomingReminders }: RightSidebarWidgetsProps) {
  return (
    <div className="w-full lg:w-[340px] shrink-0 space-y-6">
      {/* Streak Widget */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="text-orange-500" size={20} />
          <h3 className="font-extrabold text-slate-900 text-[15px]">Streak</h3>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[40px] font-extrabold text-slate-900 leading-none">7</span>
              <span className="text-[14px] font-extrabold text-blue-600">Days</span>
            </div>
            <p className="text-[12px] font-bold text-slate-500 mt-1">Keep it up! 🎉</p>
          </div>
          
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="stroke-slate-100" strokeWidth="8" fill="none" />
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
              <span className="text-[11px] font-extrabold text-blue-600">{day}</span>
              {i < 6 ? (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Check size={12} strokeWidth={3.5} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-50 border-2 border-slate-100"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-extrabold text-slate-900 text-[15px]">Upcoming Reminders</h3>
          <Link to="/dashboard/medicine-tracker" className="text-blue-600 text-[12px] font-bold hover:underline">View all</Link>
        </div>
        
        <div className="space-y-3">
          {upcomingReminders.length === 0 ? (
            <div className="text-center py-4 text-[13px] text-slate-400 font-medium">No upcoming reminders</div>
          ) : (
            upcomingReminders.map((item, index) => (
              <div key={`rem-${index}`} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                    <Clock size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-[13px] truncate">{item.med.medicine_name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium truncate">{item.med.dosage}</p>
                  </div>
                </div>
                <span className="text-[12px] font-extrabold text-blue-600 shrink-0">{item.timeLabel}</span>
              </div>
            ))
          )}
        </div>

        <button className="w-full mt-5 py-3.5 bg-[#EFF4FF] text-blue-600 rounded-2xl text-[13px] font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5">
          View all reminders <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
