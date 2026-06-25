import { AlertTriangle } from 'lucide-react';

interface LowStockAlertsProps {
  lowStockMedicines: any[];
  onRestock: (id: string, qty: number) => Promise<void>;
}

export function LowStockAlerts({ lowStockMedicines, onRestock }: LowStockAlertsProps) {
  if (lowStockMedicines.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-4 h-full">
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
  );
}
