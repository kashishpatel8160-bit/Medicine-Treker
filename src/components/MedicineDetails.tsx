import React, { useState } from 'react';
import { Medicine, Language, TranslationDict } from '../types';
import { PlusCircle, Clock, Calendar, Check, X, ShieldAlert, Archive, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { playNotificationSound } from '../utils/notifications';

interface MedicineDetailsProps {
  medicine: Medicine | null;
  onRefill: (id: string, quantity: number, notes?: string) => void;
  onLogDose: (id: string, timeSlot: string, status: 'taken' | 'missed') => void;
  onUndoDose: (id: string, logId: string) => void;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
  language: Language;
  t: TranslationDict;
}

export const MedicineDetails: React.FC<MedicineDetailsProps> = ({
  medicine,
  onRefill,
  onLogDose,
  onUndoDose,
  onEdit,
  onDelete,
  t
}) => {
  const [refillQty, setRefillQty] = useState<number>(30);
  const [refillNote, setRefillNote] = useState('');
  const [showRefillForm, setShowRefillForm] = useState(false);

  if (!medicine) {
    return (
      <div className="h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 shadow-sm min-h-[400px]">
        <Archive size={40} className="mb-3 text-slate-300 dark:text-slate-700 stroke-[1.25]" />
        <p className="text-sm font-medium">{t.selectAMedicine}</p>
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-CA');
  
  // Math calculations
  const dailyUsage = medicine.schedule.length * medicine.dosagePerTime;
  const daysRemaining = dailyUsage > 0 ? Math.floor(medicine.currentStock / dailyUsage) : Infinity;
  
  // Consumed calculations
  const totalDosesTaken = medicine.logs.filter(l => l.status === 'taken').reduce((acc, curr) => acc + curr.tabletsTaken, 0);

  // Status colors & warning labels
  let stockColor = 'bg-emerald-500 text-emerald-600 dark:text-emerald-450';
  let stockBg = 'bg-emerald-50 dark:bg-emerald-950/20';
  let stockBorder = 'border-emerald-100 dark:border-emerald-950/30';
  let stockText = t.sufficientStock;

  if (medicine.currentStock === 0) {
    stockColor = 'bg-rose-500 text-rose-600 dark:text-rose-400';
    stockBg = 'bg-rose-50 dark:bg-rose-950/20';
    stockBorder = 'border-rose-100 dark:border-rose-950/30';
    stockText = t.finished;
  } else if (daysRemaining <= 3) {
    stockColor = 'bg-rose-500 text-rose-600 dark:text-rose-450';
    stockBg = 'bg-rose-50 dark:bg-rose-950/20';
    stockBorder = 'border-rose-100 dark:border-rose-950/30';
    stockText = t.almostFinished;
  } else if (daysRemaining <= 10) {
    stockColor = 'bg-amber-500 text-amber-600 dark:text-amber-450';
    stockBg = 'bg-amber-50 dark:bg-amber-950/20';
    stockBorder = 'border-amber-100 dark:border-amber-950/30';
    stockText = t.lowStock;
  }

  const percent = medicine.totalTablets > 0 ? Math.min(100, Math.max(0, (medicine.currentStock / medicine.totalTablets) * 100)) : 0;

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refillQty <= 0 || isNaN(refillQty)) return;
    onRefill(medicine.id, refillQty, refillNote.trim());
    setRefillQty(30);
    setRefillNote('');
    setShowRefillForm(false);
    playNotificationSound('success');
  };

  const handleMarkDose = (timeSlot: string, status: 'taken' | 'missed') => {
    if (status === 'taken' && medicine.currentStock <= 0) {
      playNotificationSound('error');
      alert('Stock is empty! Please refill medicine first / स्टॉक समाप्त हो चुका है! कृपया पहले दवा रिफिल करें।');
      return;
    }
    
    onLogDose(medicine.id, timeSlot, status);
    playNotificationSound(status === 'taken' ? 'success' : 'error');
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Delete ${medicine.name}? / क्या आप हटाना चाहते हैं?`)) {
      onDelete(medicine.id);
    }
  };

  return (
    <div className="space-y-5 lg:space-y-6 bg-white dark:bg-slate-950 p-5 lg:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm animate-slide-up">
      
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {medicine.name}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <Calendar size={13} />
            Started: {medicine.startDate}
          </p>
        </div>
        
        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(medicine)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            title={t.edit}
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            title={t.delete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {daysRemaining <= 10 && (
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          medicine.currentStock === 0 || daysRemaining <= 3
            ? 'bg-rose-50/70 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400'
            : 'bg-amber-50/70 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'
        }`}>
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div className="text-xs font-semibold">
            <p className="text-[13px]">{medicine.currentStock === 0 ? t.finished : t.aboutToFinish}</p>
            {medicine.currentStock > 0 && (
              <p className="opacity-80 font-normal mt-0.5">
                Only {medicine.currentStock} tablets left. Consuming {dailyUsage} daily.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stock status grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Remaining Tablets */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {t.remainingTablets}
          </span>
          <span className="block text-xl font-black text-slate-800 dark:text-white mt-1">
            {medicine.currentStock}
          </span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            of {medicine.totalTablets} total
          </span>
        </div>

        {/* Tablets Consumed */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {t.tabletsConsumed}
          </span>
          <span className="block text-xl font-black text-slate-800 dark:text-white mt-1">
            {totalDosesTaken}
          </span>
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            since start
          </span>
        </div>

        {/* Estimated Days */}
        <div className={`p-3 border rounded-2xl text-center ${stockBg} ${stockBorder}`}>
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {t.remainingDays}
          </span>
          <span className="block text-xl font-black mt-1 text-slate-800 dark:text-white">
            {daysRemaining === Infinity ? '∞' : daysRemaining}
          </span>
          <span className={`block text-[10px] font-bold ${stockColor}`}>
            {stockText}
          </span>
        </div>
      </div>

      {/* Progress Bar visual indicator */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">Stock Capacity</span>
          <span className="text-slate-700 dark:text-slate-350">{Math.round(percent)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800/80 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              medicine.currentStock === 0
                ? 'bg-rose-500'
                : daysRemaining <= 10
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Today's Schedule tracker */}
      <div className="border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-4 bg-slate-50/40 dark:bg-slate-900/30">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-indigo-500" />
          {t.todaySchedule}
        </h3>
        
        <div className="space-y-2.5">
          {medicine.schedule.map((slot) => {
            // Find if there is a log for today
            const todayLog = medicine.logs.find(l => l.date === todayStr && l.timeSlot === slot);
            const isCompleted = todayLog?.status === 'taken';
            const isMissed = todayLog?.status === 'missed';

            return (
              <div
                key={slot}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30'
                    : isMissed
                    ? 'bg-rose-50/30 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30'
                    : 'bg-white border-slate-150 dark:bg-slate-900 dark:border-slate-800/60'
                }`}
              >
                <div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {slot}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Take {medicine.dosagePerTime} tablet(s)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {todayLog ? (
                    <>
                      {/* Logged state */}
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-450'
                      }`}>
                        {isCompleted ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                        {isCompleted ? t.taken : t.missed}
                      </span>
                      <button
                        onClick={() => onUndoDose(medicine.id, todayLog.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
                        title={t.undone}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Interactive marking buttons */}
                      <button
                        onClick={() => handleMarkDose(slot, 'missed')}
                        disabled={medicine.currentStock === 0}
                        className="px-3 py-1.5 text-xs font-semibold border border-rose-200 dark:border-rose-950 text-rose-600 dark:text-rose-450 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                      >
                        {t.markMissed}
                      </button>
                      <button
                        onClick={() => handleMarkDose(slot, 'taken')}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                      >
                        {t.markTaken}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refill Collapsible Stock Form */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowRefillForm(!showRefillForm)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs font-bold text-slate-650 dark:text-slate-400 border-b border-transparent transition-all"
        >
          <span className="flex items-center gap-1.5">
            <PlusCircle size={14} className="text-indigo-500" />
            {t.refillStock}
          </span>
          <span className="text-[10px] text-slate-400">{showRefillForm ? 'Close' : 'Add'}</span>
        </button>

        {showRefillForm && (
          <form onSubmit={handleRefillSubmit} className="p-4 bg-white dark:bg-slate-950 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  {t.quantity} (+ tablets)
                </label>
                <input
                  type="number"
                  value={refillQty}
                  onChange={(e) => setRefillQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Notes / टिप्पणी</label>
                <input
                  type="text"
                  placeholder="e.g. Bought from pharmacy"
                  value={refillNote}
                  onChange={(e) => setRefillNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              {t.addStock}
            </button>
          </form>
        )}
      </div>

      {/* Dose logs history timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t.historyLogs}
        </h3>

        <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
          {medicine.logs.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
              No activity logs recorded yet / अभी तक कोई गतिविधि लॉग रिकॉर्ड नहीं है।
            </p>
          ) : (
            // Chronological history timeline
            [
              ...medicine.logs.map(log => ({
                id: log.id,
                type: 'log',
                timestamp: log.timestamp,
                date: log.date,
                timeSlot: log.timeSlot,
                status: log.status,
                text: `${log.status === 'taken' ? 'Took' : 'Missed'} dose during ${log.timeSlot}`,
                color: log.status === 'taken' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'text-rose-500 bg-rose-50 dark:bg-rose-950/20'
              }))
            ]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((item, idx) => (
                <div key={idx} className="flex gap-3 text-xs p-2.5 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/20">
                  <div className="shrink-0 flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${item.color}`}>
                      {item.type === 'refill' ? '+' : item.status === 'taken' ? '✓' : '✗'}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {item.date} {item.timeSlot && `• ${item.timeSlot}`}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

    </div>
  );
};
