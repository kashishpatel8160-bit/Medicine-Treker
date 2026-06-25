import { Pill, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatCardsProps {
  totalMedicines: number;
  takenToday: number;
  missedToday: number;
  lowStock: number;
}

export function StatCards({ totalMedicines, takenToday, missedToday, lowStock }: StatCardsProps) {
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
          <p className="text-[11px] text-slate-400 font-medium">Active in inventory</p>
        </div>
      </div>

      {/* Taken Today */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F8EE] text-emerald-500 flex items-center justify-center shrink-0">
          <CheckCircle size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{takenToday}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Taken Today</p>
          <p className="text-[11px] text-slate-400 font-medium">Completed doses</p>
        </div>
      </div>

      {/* Missed Today */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF2ED] text-rose-500 flex items-center justify-center shrink-0">
          <XCircle size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{missedToday}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Missed Medicines</p>
          <p className="text-[11px] text-slate-400 font-medium">Needs attention</p>
        </div>
      </div>

      {/* Low Stock Medicines */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex items-center gap-5 transition-transform hover:-translate-y-1">
        <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-amber-500 flex items-center justify-center shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-[28px] font-extrabold text-slate-900 leading-none mb-1">{lowStock}</h3>
          <p className="text-[13px] text-slate-900 font-bold mb-0.5">Low Stock</p>
          <p className="text-[11px] text-slate-400 font-medium">Refill soon (&lt;10 tablets)</p>
        </div>
      </div>
    </div>
  );
}
