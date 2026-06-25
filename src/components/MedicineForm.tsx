import React, { useState, useEffect } from 'react';
import { Medicine, Language, TranslationDict } from '../types';
import { X, Calendar, Plus, Trash2 } from 'lucide-react';
import { PrescriptionUpload } from './PrescriptionUpload';

interface MedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id' | 'logs' | 'created_at' | 'updated_at' | 'remaining_quantity'> & { remaining_quantity?: number }) => void;
  editMedicine?: Medicine | null;
  language?: Language;
  t?: TranslationDict;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MedicineForm: React.FC<MedicineFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editMedicine
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [tabletsPerDay, setTabletsPerDay] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Advanced Schedule Logic
  const [frequencyType, setFrequencyType] = useState<'daily' | 'alternate_days' | 'weekly' | 'custom_days'>('daily');
  const [frequencyInterval, setFrequencyInterval] = useState<number>(2);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  
  // Skip Dates
  const [skipDates, setSkipDates] = useState<string[]>([]);
  const [skipDateInput, setSkipDateInput] = useState('');

  // Dosage Frequency
  const [dosageFrequency, setDosageFrequency] = useState<'once' | 'twice' | 'three' | 'four' | 'custom'>('once');
  const [customTimes, setCustomTimes] = useState<string[]>(['08:00']);

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

  // Calculate remaining days
  useEffect(() => {
    if (quantity && quantity > 0 && tabletsPerDay && tabletsPerDay > 0) {
      setEstimatedDays(Math.floor(Number(quantity) / Number(tabletsPerDay)));
    } else {
      setEstimatedDays(0);
    }
  }, [quantity, tabletsPerDay]);

  useEffect(() => {
    if (editMedicine) {
      setName(editMedicine.medicine_name);
      setDosage(editMedicine.dosage || '1 tablet');
      setTabletsPerDay(editMedicine.tablets_per_day || '');
      setQuantity(editMedicine.quantity);
      setLowStockThreshold(editMedicine.low_stock_threshold);
      setStartDate(editMedicine.start_date || new Date().toISOString().split('T')[0]);
      setDurationDays(editMedicine.duration_days || '');
      setNotes(editMedicine.notes || '');

      setFrequencyType(editMedicine.frequency_type || 'daily');
      setFrequencyInterval(editMedicine.frequency_interval || 2);
      setSelectedWeekdays(editMedicine.selected_weekdays ? JSON.parse(editMedicine.selected_weekdays) : []);
      setSkipDates(editMedicine.skip_dates ? JSON.parse(editMedicine.skip_dates) : []);
      
      const parsedTimes = editMedicine.custom_times ? JSON.parse(editMedicine.custom_times) : [];
      if (parsedTimes.length > 0) {
        setCustomTimes(parsedTimes);
        if (parsedTimes.length === 1) setDosageFrequency('once');
        else if (parsedTimes.length === 2) setDosageFrequency('twice');
        else if (parsedTimes.length === 3) setDosageFrequency('three');
        else if (parsedTimes.length === 4) setDosageFrequency('four');
        else setDosageFrequency('custom');
      } else {
        // Fallback for old data
        const freq = editMedicine.frequency || '';
        const times = [];
        if (freq.toLowerCase().includes('morning')) times.push('08:00');
        if (freq.toLowerCase().includes('afternoon')) times.push('14:00');
        if (freq.toLowerCase().includes('night')) times.push('20:00');
        setCustomTimes(times.length > 0 ? times : ['08:00']);
        setDosageFrequency(times.length === 1 ? 'once' : times.length === 2 ? 'twice' : times.length === 3 ? 'three' : 'custom');
      }
    } else {
      setName('');
      setDosage('1 tablet');
      setTabletsPerDay('');
      setQuantity('');
      setLowStockThreshold(10);
      setStartDate(new Date().toISOString().split('T')[0]);
      setDurationDays('');
      setNotes('');
      setFrequencyType('daily');
      setFrequencyInterval(2);
      setSelectedWeekdays([]);
      setSkipDates([]);
      setDosageFrequency('once');
      setCustomTimes(['08:00']);
    }
    setError('');
  }, [editMedicine, isOpen]);

  const handleFrequencyChange = (type: string) => {
    setDosageFrequency(type as any);
    switch (type) {
      case 'once': setCustomTimes(['08:00']); break;
      case 'twice': setCustomTimes(['08:00', '20:00']); break;
      case 'three': setCustomTimes(['08:00', '14:00', '20:00']); break;
      case 'four': setCustomTimes(['08:00', '12:00', '16:00', '20:00']); break;
      case 'custom': if (customTimes.length === 0) setCustomTimes(['08:00']); break;
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...customTimes];
    newTimes[index] = value;
    setCustomTimes(newTimes);
  };

  const addTime = () => setCustomTimes([...customTimes, '12:00']);
  const removeTime = (index: number) => setCustomTimes(customTimes.filter((_, i) => i !== index));

  const toggleWeekday = (day: string) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
    } else {
      setSelectedWeekdays([...selectedWeekdays, day]);
    }
  };

  const addSkipDate = () => {
    if (skipDateInput && !skipDates.includes(skipDateInput)) {
      setSkipDates([...skipDates, skipDateInput].sort());
      setSkipDateInput('');
    }
  };

  const removeSkipDate = (date: string) => {
    setSkipDates(skipDates.filter(d => d !== date));
  };

  if (!isOpen) return null;

  const handleExtractedText = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    if (lines.length > 0) setName(lines[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return setError('Medicine name is required');
    if (!tabletsPerDay || tabletsPerDay <= 0) return setError('Tablets Per Day must be greater than 0');
    if (!quantity || quantity <= 0) return setError('Total Tablets Available must be greater than 0');
    if (customTimes.length === 0) return setError('At least one time must be selected');
    if (frequencyType === 'weekly' && selectedWeekdays.length === 0) return setError('Select at least one weekday');
    if (frequencyType === 'alternate_days' && (!frequencyInterval || frequencyInterval < 2)) return setError('Interval must be at least 2 days');

    // Create a legacy frequency string for fallback
    const freqParts = customTimes.map(time => {
      const h = parseInt(time.split(':')[0], 10);
      if (h < 12) return `Morning (${to12h(time)})`;
      if (h < 17) return `Afternoon (${to12h(time)})`;
      return `Night (${to12h(time)})`;
    });
    const frequencyStr = freqParts.join(', ');

    onSave({
      medicine_name: name.trim(),
      dosage: dosage.trim(),
      quantity: Number(quantity),
      tablets_per_day: Number(tabletsPerDay),
      low_stock_threshold: Number(lowStockThreshold || 10),
      schedule_type: 'custom', // Use custom to avoid old parsing logic
      frequency: frequencyStr,
      frequency_type: frequencyType,
      frequency_interval: frequencyInterval,
      selected_weekdays: JSON.stringify(selectedWeekdays),
      custom_times: JSON.stringify(customTimes),
      skip_dates: JSON.stringify(skipDates),
      start_date: startDate,
      duration_days: durationDays ? Number(durationDays) : undefined,
      notes: notes.trim(),
      ...(editMedicine ? { remaining_quantity: editMedicine.remaining_quantity } : { remaining_quantity: Number(quantity) })
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {editMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 hidden md:block">
          <PrescriptionUpload onExtractedText={handleExtractedText} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Medicine Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" />
            </div>
            
            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Dosage</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 500mg, 1 Tablet" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tablets Per Day</label>
              <input type="number" value={tabletsPerDay} onChange={(e) => setTabletsPerDay(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 2" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" min="0.1" step="0.1" />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Total Tablets Available</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100" min="1" />
            </div>
          </div>
          
          {quantity && tabletsPerDay && quantity > 0 && tabletsPerDay > 0 && (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${estimatedDays <= 10 ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/50' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'}`}>
              <div>
                <span className="block text-[13px] font-bold text-slate-600 dark:text-slate-300">Remaining Days</span>
                <span className={`text-xl font-extrabold ${estimatedDays <= 10 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {estimatedDays} Days
                </span>
              </div>
              {estimatedDays <= 10 && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-sm bg-orange-100/50 dark:bg-orange-900/50 px-3 py-1.5 rounded-lg">
                  <span className="text-lg">⚠</span> Only {estimatedDays} days of medicine remaining
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Schedule Logic */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" /> Daily Consumption Schedule
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['daily', 'alternate_days', 'weekly', 'custom_days'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFrequencyType(type as any)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${frequencyType === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                >
                  {type === 'daily' ? 'Every Day' : type === 'alternate_days' ? 'Intervals' : type === 'weekly' ? 'Specific Days' : 'Custom Days'}
                </button>
              ))}
            </div>

            {frequencyType === 'alternate_days' && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">Take medicine every</span>
                <input type="number" value={frequencyInterval} onChange={e => setFrequencyInterval(parseInt(e.target.value) || 2)} min="2" className="w-16 px-2 py-1 rounded border text-center dark:bg-slate-800 dark:border-slate-600 dark:text-white" />
                <span className="text-sm text-slate-600 dark:text-slate-300">days</span>
              </div>
            )}

            {(frequencyType === 'weekly' || frequencyType === 'custom_days') && (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                {WEEKDAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(day)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${selectedWeekdays.includes(day) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            )}

            {/* Dosage Frequency Times */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Times Per Day</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {['once', 'twice', 'three', 'four', 'custom'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleFrequencyChange(freq)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${dosageFrequency === freq ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)} {freq !== 'custom' && 'Daily'}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col gap-2">
                {customTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                    />
                    {dosageFrequency === 'custom' && customTimes.length > 1 && (
                      <button type="button" onClick={() => removeTime(index)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {dosageFrequency === 'custom' && (
                  <button type="button" onClick={addTime} className="self-start flex items-center gap-1 mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                    <Plus size={14} /> Add Time
                  </button>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Skip Days */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Skip Days</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                value={skipDateInput}
                onChange={e => setSkipDateInput(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white flex-1"
              />
              <button type="button" onClick={addSkipDate} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                Add Skip Date
              </button>
            </div>
            {skipDates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skipDates.map(date => (
                  <div key={date} className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium border border-rose-100 dark:border-rose-800/50">
                    {date}
                    <button type="button" onClick={() => removeSkipDate(date)} className="hover:text-rose-900 dark:hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            Save Medicine
          </button>
        </div>
      </div>
    </div>
  );
};
