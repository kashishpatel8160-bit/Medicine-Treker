import React, { useState, useEffect } from 'react';
import { Medicine, ScheduleType, Language, TranslationDict } from '../types';
import { X, Sunrise, Sun, Moon } from 'lucide-react';
import { PrescriptionUpload } from './PrescriptionUpload';

interface MedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id' | 'logs' | 'created_at' | 'updated_at' | 'remaining_quantity'> & { remaining_quantity?: number }) => void;
  editMedicine?: Medicine | null;
  language?: Language;
  t?: TranslationDict;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editMedicine
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(10);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [scheduleDays, setScheduleDays] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Customizable slots checkboxes & time pickers
  const [morning, setMorning] = useState(true);
  const [afternoon, setAfternoon] = useState(true);
  const [night, setNight] = useState(true);

  const [morningTime, setMorningTime] = useState('08:30');
  const [afternoonTime, setAfternoonTime] = useState('14:00');
  const [nightTime, setNightTime] = useState('20:00');

  // Duration in Days instead of direct End Date
  const [durationDays, setDurationDays] = useState<number | ''>('');

  // Calculate estimated days
  const [estimatedDays, setEstimatedDays] = useState(0);

  // Helper to convert "14:00" to "02:00 PM"
  const to12h = (time24: string): string => {
    if (!time24) return '';
    const parts = time24.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    return `${hoursStr}:${minutes} ${ampm}`;
  };

  // Helper to convert "02:00 PM" to "14:00"
  const to24h = (time12h: string): string => {
    if (!time12h) return '12:00';
    const match = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '12:00';
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const hoursStr = hours < 10 ? `0${hours}` : hours;
    return `${hoursStr}:${minutes}`;
  };

  useEffect(() => {
    if (quantity && quantity > 0) {
      let dosesPerDay = 0;
      if (morning) dosesPerDay++;
      if (afternoon) dosesPerDay++;
      if (night) dosesPerDay++;
      const dosageNum = parseFloat(dosage) || 1;
      const dailyTablets = dosesPerDay * dosageNum;
      if (dailyTablets > 0) {
        setEstimatedDays(Math.floor(Number(quantity) / dailyTablets));
      } else {
        setEstimatedDays(0);
      }
    } else {
      setEstimatedDays(0);
    }
  }, [quantity, dosage, morning, afternoon, night]);

  useEffect(() => {
    if (editMedicine) {
      setName(editMedicine.medicine_name);
      setDosage(editMedicine.dosage || '1 tablet');
      setQuantity(editMedicine.quantity);
      setLowStockThreshold(editMedicine.low_stock_threshold);
      setScheduleType(editMedicine.schedule_type || 'daily');
      setScheduleDays(editMedicine.schedule_days || '');
      setStartDate(editMedicine.start_date || new Date().toISOString().split('T')[0]);
      setNotes(editMedicine.notes || '');

      const freq = editMedicine.frequency || 'Morning, Afternoon, Night';
      setMorning(freq.toLowerCase().includes('morning'));
      setAfternoon(freq.toLowerCase().includes('afternoon'));
      setNight(freq.toLowerCase().includes('night'));

      const morningMatch = freq.match(/Morning\s*\(([^)]+)\)/i);
      const afternoonMatch = freq.match(/Afternoon\s*\(([^)]+)\)/i);
      const nightMatch = freq.match(/Night\s*\(([^)]+)\)/i);

      setMorningTime(morningMatch ? to24h(morningMatch[1]) : '08:30');
      setAfternoonTime(afternoonMatch ? to24h(afternoonMatch[1]) : '14:00');
      setNightTime(nightMatch ? to24h(nightMatch[1]) : '20:00');

      setDurationDays(editMedicine.duration_days || '');
    } else {
      setName('');
      setDosage('1 tablet');
      setQuantity('');
      setLowStockThreshold(10);
      setScheduleType('daily');
      setScheduleDays('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setMorning(true);
      setAfternoon(true);
      setNight(true);
      setMorningTime('08:30');
      setAfternoonTime('14:00');
      setNightTime('20:00');
      setDurationDays('');
    }
    setError('');
  }, [editMedicine, isOpen]);

  if (!isOpen) return null;

  const handleExtractedText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    if (lines.length > 0) {
      setName(lines[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Medicine name is required');
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('Total quantity must be greater than 0');
      return;
    }
    if (!morning && !afternoon && !night) {
      setError('At least one schedule slot (Morning, Afternoon, or Night) must be selected');
      return;
    }

    const freqParts = [];
    if (morning) freqParts.push(`Morning (${to12h(morningTime)})`);
    if (afternoon) freqParts.push(`Afternoon (${to12h(afternoonTime)})`);
    if (night) freqParts.push(`Night (${to12h(nightTime)})`);
    const frequencyStr = freqParts.join(', ');

    onSave({
      medicine_name: name.trim(),
      dosage: dosage.trim(),
      quantity: Number(quantity),
      low_stock_threshold: Number(lowStockThreshold || 10),
      schedule_type: scheduleType,
      schedule_days: scheduleDays.trim(),
      frequency: frequencyStr,
      start_date: startDate,
      duration_days: durationDays ? Number(durationDays) : undefined,
      notes: notes.trim(),
      ...(editMedicine ? { remaining_quantity: editMedicine.remaining_quantity } : {})
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <PrescriptionUpload onExtractedText={handleExtractedText} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-450 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Medicine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-850 dark:text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Enter quantity / stock"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-850 dark:text-slate-200"
                min="1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Low Stock Alert</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Alert threshold"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-850 dark:text-slate-200"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-850 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Duration (Days)</label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Ongoing (leave blank)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-850 dark:text-slate-200"
                min="1"
              />
            </div>
          </div>

          {estimatedDays > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex justify-between items-center animate-fade-in">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Estimated duration:</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">~{estimatedDays} days ({[morning, afternoon, night].filter(Boolean).length} doses/day)</span>
            </div>
          )}

          {/* Time Schedule Inputs */}
          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timing Schedule</label>
            
            <div className="space-y-2.5">
              {/* Morning */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={morning}
                    onChange={(e) => setMorning(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <div className="flex items-center gap-1.5">
                    <Sunrise size={16} className="text-amber-500" />
                    <span className="text-sm font-bold text-slate-750 dark:text-slate-200">Morning</span>
                  </div>
                </label>
                {morning && (
                  <input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                )}
              </div>

              {/* Afternoon */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={afternoon}
                    onChange={(e) => setAfternoon(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <div className="flex items-center gap-1.5">
                    <Sun size={16} className="text-sky-500" />
                    <span className="text-sm font-bold text-slate-750 dark:text-slate-200">Afternoon</span>
                  </div>
                </label>
                {afternoon && (
                  <input
                    type="time"
                    value={afternoonTime}
                    onChange={(e) => setAfternoonTime(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                )}
              </div>

              {/* Night */}
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={night}
                    onChange={(e) => setNight(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  />
                  <div className="flex items-center gap-1.5">
                    <Moon size={16} className="text-indigo-500" />
                    <span className="text-sm font-bold text-slate-750 dark:text-slate-200">Night</span>
                  </div>
                </label>
                {night && (
                  <input
                    type="time"
                    value={nightTime}
                    onChange={(e) => setNightTime(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add dosage instructions or other notes..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] font-medium text-slate-850 dark:text-slate-200"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Save Medicine
          </button>
        </div>
      </div>
    </div>
  );
};
