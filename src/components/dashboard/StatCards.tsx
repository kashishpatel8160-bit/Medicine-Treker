import { Pill, Calendar, Clock, CheckCircle } from 'lucide-react';

interface StatCardsProps {
  totalMedicines: number;
  dueToday: number;
  missed: number;
  completed: number;
}

export function StatCards({ totalMedicines, dueToday, missed, completed }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Medicines */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] text-blue-600 flex items-center justify-center shrink-0">
          <Pill size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{totalMedicines}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Total Medicines</p>
          <p className="text-[11px] text-slate-400 font-medium">All medicines added</p>
        </div>
      </div>

      {/* Due Today */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F8EE] text-emerald-500 flex items-center justify-center shrink-0">
          <Calendar size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{dueToday}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Due Today</p>
          <p className="text-[11px] text-slate-400 font-medium">To be taken today</p>
        </div>
      </div>

      {/* Missed */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF2ED] text-orange-500 flex items-center justify-center shrink-0">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{missed}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Missed</p>
          <p className="text-[11px] text-slate-400 font-medium">Take them now</p>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#F4F0FF] text-purple-600 flex items-center justify-center shrink-0">
          <CheckCircle size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{completed}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Completed</p>
          <p className="text-[11px] text-slate-400 font-medium">This week</p>
        </div>
      </div>
    </div>
  );
}
