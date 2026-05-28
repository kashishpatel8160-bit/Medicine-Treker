import React, { useState, useMemo } from 'react';
import { Medicine, Language, TranslationDict } from '../types';
import { Search, AlertTriangle, Check, Layers, Filter } from 'lucide-react';

interface MedicineListProps {
  medicines: Medicine[];
  selectedId?: string;
  onSelect: (medicine: Medicine) => void;
  language: Language;
  t: TranslationDict;
}

type FilterType = 'all' | 'low' | 'completed';

export const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  selectedId,
  onSelect,
  t
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      // Search term match
      const nameMatch = med.name.toLowerCase().includes(searchTerm.toLowerCase());
      const notesMatch = med.notes ? med.notes.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      const matchesSearch = nameMatch || notesMatch;

      if (!matchesSearch) return false;

      // Status calculations
      const dailyUsage = med.schedule.length * med.dosagePerTime;
      const daysRemaining = dailyUsage > 0 ? Math.floor(med.currentStock / dailyUsage) : Infinity;

      if (activeFilter === 'low') {
        return med.currentStock > 0 && daysRemaining <= 10;
      }
      if (activeFilter === 'completed') {
        return med.currentStock === 0;
      }
      return true; // 'all'
    });
  }, [medicines, searchTerm, activeFilter]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden animate-slide-up">
      {/* Title & Search Area */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Layers size={18} className="text-indigo-500" />
          {t.medicinesList}
        </h2>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex p-0.5 bg-slate-200/60 dark:bg-slate-900 rounded-lg gap-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('low')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
              activeFilter === 'low'
                ? 'bg-amber-500 dark:bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500'
            }`}
          >
            <AlertTriangle size={11} />
            Low
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
              activeFilter === 'completed'
                ? 'bg-emerald-500 dark:bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500'
            }`}
          >
            <Check size={11} />
            Done
          </button>
        </div>
      </div>

      {/* Medicines List Scroller */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh] lg:max-h-[60vh]">
        {filteredMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-slate-400 dark:text-slate-500">
            <Filter size={24} className="mb-2 stroke-[1.5]" />
            <p className="text-sm">{t.noMedicinesFound}</p>
          </div>
        ) : (
          filteredMedicines.map((med) => {
            const isSelected = med.id === selectedId;
            const dailyUsage = med.schedule.length * med.dosagePerTime;
            const daysRemaining = dailyUsage > 0 ? Math.floor(med.currentStock / dailyUsage) : Infinity;
            
            // Stock indicators
            let stockColor = 'bg-emerald-500';
            let statusText = `${daysRemaining} ${t.days}`;
            
            if (med.currentStock === 0) {
              stockColor = 'bg-rose-500';
              statusText = 'Completed';
            } else if (daysRemaining <= 3) {
              stockColor = 'bg-rose-500 animate-pulse';
              statusText = 'Almost empty';
            } else if (daysRemaining <= 10) {
              stockColor = 'bg-amber-500';
              statusText = 'Low stock';
            }

            const percent = med.totalTablets > 0 ? Math.min(100, Math.max(0, (med.currentStock / med.totalTablets) * 100)) : 0;

            return (
              <button
                key={med.id}
                onClick={() => onSelect(med)}
                className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col gap-1.5 ${
                  isSelected
                    ? 'border-indigo-500/80 bg-indigo-50/40 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30 shadow-sm'
                    : 'border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-800'
                }`}
              >
                {/* Visual Highlight bar on selected */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500" />
                )}

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[65%]">
                    {med.name}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    med.currentStock === 0
                      ? 'bg-rose-150 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                      : daysRemaining <= 10
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {statusText}
                  </span>
                </div>

                {/* Info summary */}
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  <span>{med.currentStock} / {med.totalTablets} Tab</span>
                  <span>•</span>
                  <span>{med.schedule.length}x daily</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${stockColor}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
