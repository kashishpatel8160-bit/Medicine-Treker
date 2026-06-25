import { Pill, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface MedicineCardProps {
  medicine: any;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
}

export function MedicineCard({ medicine, onEdit, onDelete, onViewDetails }: MedicineCardProps) {
  // Calculate daily consumption and remaining days
  let dailyDoses = 1;
  let scheduleText = 'Daily';

  if (medicine.frequency_type) {
    if (medicine.frequency_type === 'daily') scheduleText = 'Every Day';
    else if (medicine.frequency_type === 'alternate_days') scheduleText = `Every ${medicine.frequency_interval || 2} Days`;
    else if (medicine.frequency_type === 'weekly') {
      try {
        const days = JSON.parse(medicine.selected_weekdays || '[]');
        scheduleText = days.length > 0 ? days.map((d: string) => d.substring(0,3)).join(', ') : 'Weekly';
      } catch (e) { scheduleText = 'Weekly'; }
    } else if (medicine.frequency_type === 'custom_days') {
       scheduleText = 'Custom Days';
    }
  }

  if (medicine.custom_times) {
    try {
      dailyDoses = JSON.parse(medicine.custom_times).length || 1;
    } catch (e) {}
  } else if (medicine.frequency) {
    dailyDoses = medicine.frequency.split(',').length;
  }

  const dosageNum = parseFloat(medicine.dosage) || 1;
  const dailyConsumption = medicine.tablets_per_day || (dailyDoses * dosageNum);
  
  let remainingDays = 0;
  if (dailyConsumption > 0) {
    remainingDays = Math.floor(medicine.remaining_quantity / dailyConsumption);
    if (!medicine.tablets_per_day) {
      if (medicine.frequency_type === 'alternate_days') remainingDays *= (medicine.frequency_interval || 2);
      if (medicine.frequency_type === 'weekly' && medicine.selected_weekdays) {
        try {
          const days = JSON.parse(medicine.selected_weekdays);
          if (days.length > 0) remainingDays *= (7 / days.length);
        } catch (e) {}
      }
    }
    remainingDays = Math.floor(remainingDays);
  }

  const isLowStock = remainingDays <= 10 && remainingDays > 3;
  const isCritical = remainingDays <= 3;
  
  const status = isCritical ? 'Critical' : isLowStock ? 'Low Stock' : 'Active';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col hover:border-blue-200 dark:hover:border-blue-900 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Pill size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white leading-tight">{medicine.medicine_name}</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
               {scheduleText}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Dosage</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {medicine.dosage || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Tablets Per Day</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {medicine.tablets_per_day || dailyConsumption || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Total Stock</span>
          <span className="font-extrabold text-slate-900 dark:text-white">
            {medicine.remaining_quantity} Tablets
          </span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Remaining</span>
          <span className={`font-extrabold ${isCritical ? 'text-red-500' : isLowStock ? 'text-orange-500' : 'text-slate-900 dark:text-white'}`}>
            {remainingDays} Days
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'Active' ? (
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-extrabold">
              Active
            </span>
          ) : status === 'Low Stock' ? (
            <span className="px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-[11px] font-extrabold flex items-center gap-1">
              <AlertCircle size={12} /> Low Stock
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[11px] font-extrabold flex items-center gap-1">
              <AlertCircle size={12} /> Critical
            </span>
          )}
        </div>
        {onViewDetails && (
           <button onClick={onViewDetails} className="text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
             Details
           </button>
        )}
      </div>
    </div>
  );
}
