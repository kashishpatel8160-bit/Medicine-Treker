import { Pill, Plus, Bell, UploadCloud, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentAndQuickActionsProps {
  recentMedicines: any[];
  onUploadPrescription: () => void;
}

export function RecentAndQuickActions({ recentMedicines, onUploadPrescription }: RecentAndQuickActionsProps) {
  const getIconStyles = (index: number) => {
    const styles = [
      'bg-blue-100 text-blue-600',
      'bg-orange-100 text-orange-500',
      'bg-purple-100 text-purple-600',
      'bg-emerald-100 text-emerald-600'
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {/* Recent Medicines */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[15px] font-extrabold text-slate-900">Recent Medicines</h3>
          <Link to="/dashboard/medicines" className="text-blue-600 text-[12px] font-bold hover:underline">View all</Link>
        </div>
        <div className="space-y-4 flex-1">
          {recentMedicines.length === 0 ? (
            <div className="text-center text-[13px] text-slate-400 font-medium py-4">No recent medicines</div>
          ) : (
            recentMedicines.slice(0, 1).map((med, index) => (
              <div key={med.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-blue-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getIconStyles(index)}`}>
                    <Pill size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-[14px] truncate">{med.medicine_name}</h4>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5 truncate">{med.dosage} • Before Sleep</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-extrabold shrink-0">
                  Active
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-[15px] font-extrabold text-slate-900 mb-5 pl-1">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          <button className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="text-[11px] font-extrabold text-slate-600 text-center leading-tight">Add<br/>Medicine</span>
          </button>
          
          <button className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bell size={20} />
            </div>
            <span className="text-[11px] font-extrabold text-slate-600 text-center leading-tight">Add<br/>Reminder</span>
          </button>
          
          <button onClick={onUploadPrescription} className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud size={20} />
            </div>
            <span className="text-[11px] font-extrabold text-slate-600 text-center leading-tight">Upload<br/>Prescription</span>
          </button>
          
          <button className="bg-white p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform group">
            <div className="w-12 h-12 rounded-full bg-orange-400 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <span className="text-[11px] font-extrabold text-slate-600 text-center leading-tight">Health<br/>Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
