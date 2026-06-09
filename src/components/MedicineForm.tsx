import React, { useState, useEffect } from 'react';
import { Medicine, Language, TranslationDict } from '../types';
import { X, Plus, Check } from 'lucide-react';

interface MedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id' | 'createdAt' | 'refills' | 'logs'> & { id?: string }) => void;
  editMedicine?: Medicine | null;
  language: Language;
  t: TranslationDict;
}

const DEFAULT_SCHEDULES = ['Morning', 'Afternoon', 'Evening', 'Night'];

export const MedicineForm: React.FC<MedicineFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editMedicine,
  t
}) => {
  const [name, setName] = useState('');
  const [totalTablets, setTotalTablets] = useState<number | ''>('');
  const [dosagePerTime, setDosagePerTime] = useState<number | ''>('');
  const [selectedStandardSlots, setSelectedStandardSlots] = useState<string[]>([]);
  const [customSlots, setCustomSlots] = useState<string[]>([]);
  const [newCustomSlot, setNewCustomSlot] = useState('');
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Prefill when editing
  useEffect(() => {
    if (editMedicine) {
      setName(editMedicine.name);
      setTotalTablets(editMedicine.totalTablets);
      setDosagePerTime(editMedicine.dosagePerTime);
      setStartDate(editMedicine.startDate);
      setNotes(editMedicine.notes || '');
      
      const standards = editMedicine.schedule.filter(s => DEFAULT_SCHEDULES.includes(s));
      const customs = editMedicine.schedule.filter(s => !DEFAULT_SCHEDULES.includes(s));
      
      setSelectedStandardSlots(standards);
      setCustomSlots(customs);
    } else {
      // Reset
      setName('');
      setTotalTablets('');
      setDosagePerTime('');
      setSelectedStandardSlots(['Morning', 'Night']);
      setCustomSlots([]);
      setStartDate(new Date().toLocaleDateString('en-CA'));
      setNotes('');
    }
    setError('');
  }, [editMedicine, isOpen]);

  if (!isOpen) return null;

  const toggleStandardSlot = (slot: string) => {
    setSelectedStandardSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const addCustomSlot = () => {
    const trimmed = newCustomSlot.trim();
    if (!trimmed) return;
    if (customSlots.includes(trimmed) || DEFAULT_SCHEDULES.includes(trimmed)) {
      setError('Time slot already exists / समय स्लॉट पहले से मौजूद है');
      return;
    }
    setCustomSlots(prev => [...prev, trimmed]);
    setNewCustomSlot('');
    setError('');
  };

  const removeCustomSlot = (slot: string) => {
    setCustomSlots(prev => prev.filter(s => s !== slot));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Medicine name is required / दवा का नाम आवश्यक है');
      return;
    }

    const parsedTotalTablets = typeof totalTablets === 'number' ? totalTablets : parseInt(totalTablets || '0');
    if (!parsedTotalTablets || isNaN(parsedTotalTablets) || parsedTotalTablets <= 0) {
      setError('Tablet count must be greater than 0 / गोलियों की संख्या 0 से अधिक होनी चाहिए');
      return;
    }

    const parsedDosagePerTime = typeof dosagePerTime === 'number' ? dosagePerTime : parseInt(dosagePerTime || '0');
    if (!parsedDosagePerTime || isNaN(parsedDosagePerTime) || parsedDosagePerTime <= 0) {
      setError('Dosage must be greater than 0 / खुराक 0 से अधिक होनी चाहिए');
      return;
    }

    const combinedSchedule = [...selectedStandardSlots, ...customSlots];
    if (combinedSchedule.length === 0) {
      setError('Select at least one schedule time / कम से कम एक खुराक का समय चुनें');
      return;
    }

    onSave({
      id: editMedicine?.id,
      name: name.trim(),
      totalTablets: parsedTotalTablets,
      currentStock: editMedicine ? Math.min(parsedTotalTablets, editMedicine.currentStock) : parsedTotalTablets,
      dosagePerTime: parsedDosagePerTime,
      schedule: combinedSchedule,
      startDate,
      notes: notes.trim()
    });

    onClose();
  };

  // Dual English and Hindi labels helper
  const renderLabel = (en: string, hi: string) => (
    <span className="flex items-center gap-1">
      <span className="font-medium text-slate-800 dark:text-slate-200">{en}</span>
      <span className="text-xs text-slate-400 dark:text-slate-500">({hi})</span>
    </span>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editMedicine ? `${t.edit} - ${editMedicine.name}` : t.addNewMedicine}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-950/40 rounded-xl">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {renderLabel('Medicine Name', 'दवा का नाम')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paracetamol / पैरासिटामोल"
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
              autoFocus
            />
          </div>

          {/* Quantities Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Tablets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {renderLabel('Total Tablets', 'कुल गोलियाँ')}
              </label>
              <input
                type="number"
                value={totalTablets}
                onChange={(e) => {
                  const val = e.target.value;
                  setTotalTablets(val === '' ? '' : parseInt(val));
                }}
                placeholder="Enter total tablets"
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
                min="1"
              />
            </div>

            {/* Dosage per time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {renderLabel('Dosage Each Time', 'एक बार की खुराक')}
              </label>
              <input
                type="number"
                value={dosagePerTime}
                onChange={(e) => {
                  const val = e.target.value;
                  setDosagePerTime(val === '' ? '' : parseInt(val));
                }}
                placeholder="Enter dosage"
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
                min="1"
              />
            </div>
          </div>

          {/* Schedule Checkbox list */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {renderLabel('Daily Dosage Schedule', 'दैनिक खुराक का समय')}
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_SCHEDULES.map((slot) => {
                const isChecked = selectedStandardSlots.includes(slot);
                const hindiSlot = slot === 'Morning' ? 'सुबह' : slot === 'Afternoon' ? 'दोपहर' : slot === 'Evening' ? 'शाम' : 'रात';
                return (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => toggleStandardSlot(slot)}
                    className={`flex items-center gap-3 px-4 py-2.5 border rounded-xl transition-all duration-300 text-sm font-medium ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-semibold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-sm shadow-blue-500/10'
                        : 'border-slate-300 dark:border-slate-600 bg-transparent'
                    }`}>
                      {isChecked && <Check size={11} strokeWidth={3} className="animate-scale-in" />}
                    </div>
                    <span>{slot} <span className="text-[10px] opacity-60">({hindiSlot})</span></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom time slots */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {renderLabel('Or Add Custom Time', 'या कस्टम समय जोड़ें')}
            </label>
            
            <div className="flex gap-2">
              <input
                type="time"
                value={newCustomSlot}
                onChange={(e) => setNewCustomSlot(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={addCustomSlot}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Custom slots pills list */}
            {customSlots.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customSlots.map((slot) => (
                  <span
                    key={slot}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => removeCustomSlot(slot)}
                      className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {renderLabel('Start Date', 'शुरू करने की तिथि')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {renderLabel('Optional Notes', 'वैकल्पिक टिप्पणी')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take after food / भोजन के बाद लें"
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm min-h-[70px] max-h-[140px]"
            />
          </div>
        </form>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-255 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:shadow-md hover:brightness-105 active:scale-98 transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
