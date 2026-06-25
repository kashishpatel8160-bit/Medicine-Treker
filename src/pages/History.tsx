import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PageHeader } from '../components/dashboard/PageHeader';
import { CheckCircle, XCircle, Calendar, Filter, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function History() {
  const { user } = useAuth();
  const { medicines } = useMedicines();
  const [filterDate, setFilterDate] = useState('');

  // Group logs by Date, then by Time Slot
  const groupedHistory = useMemo(() => {
    const allLogs: { medicineName: string, dosage: string, date: string, timeSlot: string, status: 'taken' | 'missed' }[] = [];
    
    medicines.forEach(med => {
      if (med.logs) {
        med.logs.forEach(log => {
          allLogs.push({
            medicineName: med.medicine_name,
            dosage: med.dosage,
            date: log.date,
            timeSlot: log.timeSlot,
            status: log.status
          });
        });
      }
    });

    // Grouping structure: { "2026-06-25": { "Morning": { taken: [...], missed: [...] } } }
    const dateGroups: Record<string, Record<string, { taken: { name: string, dosage: string }[], missed: { name: string, dosage: string }[] }>> = {};

    allLogs.forEach(log => {
      const date = log.date;
      const slot = log.timeSlot;

      if (!dateGroups[date]) {
        dateGroups[date] = {};
      }
      if (!dateGroups[date][slot]) {
        dateGroups[date][slot] = { taken: [], missed: [] };
      }

      if (log.status === 'taken') {
        dateGroups[date][slot].taken.push({ name: log.medicineName, dosage: log.dosage });
      } else {
        dateGroups[date][slot].missed.push({ name: log.medicineName, dosage: log.dosage });
      }
    });

    // Map to a sorted array
    const sortedList = Object.entries(dateGroups).map(([date, slots]) => {
      const slotList = Object.entries(slots).map(([slotName, data]) => {
        let status: 'Completed' | 'Partial' | 'Missed' = 'Completed';
        if (data.taken.length === 0 && data.missed.length > 0) {
          status = 'Missed';
        } else if (data.taken.length > 0 && data.missed.length > 0) {
          status = 'Partial';
        }

        return {
          slotName,
          taken: data.taken,
          missed: data.missed,
          status
        };
      });

      // Sort slots by time label logic (Morning first, Afternoon second, Night last)
      const slotOrder = ['Morning', 'Afternoon', 'Night'];
      slotList.sort((a, b) => slotOrder.indexOf(a.slotName) - slotOrder.indexOf(b.slotName));

      return {
        date,
        slots: slotList
      };
    });

    // Sort by date descending
    return sortedList.sort((a, b) => b.date.localeCompare(a.date));
  }, [medicines]);

  // Filter history by date if selected
  const filteredHistory = useMemo(() => {
    if (!filterDate) return groupedHistory;
    return groupedHistory.filter(h => h.date === filterDate);
  }, [groupedHistory, filterDate]);

  const getStatusBadge = (status: 'Completed' | 'Partial' | 'Missed') => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold">Completed</span>;
      case 'Partial':
        return <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-705 dark:text-amber-400 rounded-full text-[10px] font-bold">Partial</span>;
      case 'Missed':
        return <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-full text-[10px] font-bold">Missed</span>;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="History Log" 
        subtitle="Review your historical medicine intake and completion status." 
        user={user} 
      />

      <div className="flex flex-col gap-6">
        {/* Date Filter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Filter Activity</h3>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Timeline List */}
        <div className="space-y-6">
          {filteredHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 font-semibold text-sm">
              {filterDate ? "No activity logs found for the selected date." : "No dosage logs recorded yet. Once you mark a schedule as taken, it will appear here."}
            </div>
          ) : (
            filteredHistory.map(dayGroup => {
              // Format date cleanly: e.g. "25 Jun 2026"
              const parsedDate = new Date(dayGroup.date + 'T00:00:00');
              const formattedDate = format(parsedDate, 'dd MMM yyyy');
              const dayName = format(parsedDate, 'eeee');

              return (
                <div key={dayGroup.date} className="space-y-4">
                  {/* Timeline Date Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
                      {formattedDate}
                      <span className="text-[11px] font-semibold text-slate-400">{dayName}</span>
                    </h3>
                  </div>

                  {/* Slots Card List */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-10 border-l border-slate-200 dark:border-slate-800 relative">
                    {dayGroup.slots.map(slot => (
                      <div 
                        key={slot.slotName}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                      >
                        <div>
                          {/* Slot Header */}
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-slate-905 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                              <Clock size={13} className="text-slate-400" />
                              {slot.slotName}
                            </h4>
                            {getStatusBadge(slot.status)}
                          </div>

                          {/* Medicine Rows */}
                          <div className="space-y-2">
                            {/* Taken Medicines */}
                            {slot.taken.map((med, idx) => (
                              <div key={`taken-${idx}`} className="flex items-center gap-2 p-1.5 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-lg">
                                <CheckCircle size={14} className="text-emerald-555 shrink-0" />
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">
                                  {med.name}
                                </span>
                              </div>
                            ))}

                            {/* Missed Medicines */}
                            {slot.missed.map((med, idx) => (
                              <div key={`missed-${idx}`} className="flex items-center gap-2 p-1.5 bg-rose-50/20 dark:bg-rose-950/10 rounded-lg">
                                <XCircle size={14} className="text-rose-500 shrink-0" />
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">
                                  {med.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Summary Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-850 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-semibold">Total Doses</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-205">
                            {slot.taken.length} / {slot.taken.length + slot.missed.length}
                          </span>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
