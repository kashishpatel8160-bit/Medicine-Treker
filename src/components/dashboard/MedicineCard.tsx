import { Pill, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface MedicineCardProps {
  medicine: any;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
}

export function MedicineCard({ medicine, onEdit, onDelete, onViewDetails }: MedicineCardProps) {
  const isLowStock = medicine.remaining_quantity <= medicine.low_stock_threshold;
  
  // Try to determine general status. (This is simplified, you can add more logic)
  const status = isLowStock ? 'Low Stock' : 'Active';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col hover:border-blue-100 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Pill size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 leading-tight">{medicine.medicine_name}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
               {medicine.dosage} • {medicine.frequency || 'Daily'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 font-medium">Stock Left</span>
          <span className={`font-extrabold ${isLowStock ? 'text-orange-500' : 'text-slate-900'}`}>
            {medicine.remaining_quantity}
          </span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 font-medium">Next Dose</span>
          <span className="font-extrabold text-slate-900">Today, 08:00 PM</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'Active' ? (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-extrabold">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[11px] font-extrabold flex items-center gap-1">
              <AlertCircle size={12} /> Low Stock
            </span>
          )}
        </div>
        {onViewDetails && (
           <button onClick={onViewDetails} className="text-[12px] font-bold text-blue-600 hover:underline">
             Details
           </button>
        )}
      </div>
    </div>
  );
}
