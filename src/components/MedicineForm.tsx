import React, { useState, useEffect } from 'react';
import { Medicine, ScheduleType, Language, TranslationDict } from '../types';
import { X } from 'lucide-react';
import { PrescriptionUpload } from './PrescriptionUpload';

interface MedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Omit<Medicine, 'id' | 'logs' | 'created_at' | 'updated_at' | 'remaining_quantity'> & { remaining_quantity?: number }) => void;
  editMedicine?: Medicine | null;
  fixedFrequency?: string;
  language?: Language;
  t?: TranslationDict;
}

export const MedicineForm: React.FC<MedicineFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editMedicine,
  fixedFrequency
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(10);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [scheduleDays, setScheduleDays] = useState('');
  const [frequency, setFrequency] = useState(fixedFrequency || 'Morning');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [refillStock, setRefillStock] = useState(false);

  // Calculate estimated days
  const [estimatedDays, setEstimatedDays] = useState(0);

  useEffect(() => {
    if (quantity && quantity > 0) {
      let dosesPerDay = 1;
      const freqMultiplier = frequency.split(',').length; // very rough heuristic
      
      if (scheduleType === 'daily') dosesPerDay = 1 * freqMultiplier;
      else if (scheduleType === 'twice_daily') dosesPerDay = 2;
      else if (scheduleType === 'three_times_daily') dosesPerDay = 3;
      else if (scheduleType === 'alternate_days') dosesPerDay = 0.5 * freqMultiplier;
      else if (scheduleType === 'weekly') dosesPerDay = (1 / 7) * freqMultiplier * (scheduleDays.split(',').length || 1);
      else if (scheduleType === 'monthly') dosesPerDay = (1 / 30) * freqMultiplier;
      
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
  }, [quantity, dosage, scheduleType, frequency, scheduleDays]);

  useEffect(() => {
    if (editMedicine) {
      setName(editMedicine.medicine_name);
      setDosage(editMedicine.dosage);
      setQuantity(editMedicine.quantity);
      setLowStockThreshold(editMedicine.low_stock_threshold);
      setScheduleType(editMedicine.schedule_type);
      setScheduleDays(editMedicine.schedule_days || '');
      // When editing, keep the original frequency but map Day/Afternoon to Afternoon
      setFrequency(editMedicine.frequency.replace('Day/Afternoon', 'Afternoon'));
      setStartDate(editMedicine.start_date);
      setNotes(editMedicine.notes || '');
      setRefillStock(editMedicine.remaining_quantity <= editMedicine.low_stock_threshold);
    } else {
      setName('');
      setDosage('');
      setQuantity('');
      setLowStockThreshold(10);
      setScheduleType('daily');
      setScheduleDays('');
      setFrequency(fixedFrequency || 'Morning');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setRefillStock(false);
    }
    setError('');
  }, [editMedicine, fixedFrequency, isOpen]);

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
    if (!dosage.trim()) {
      setError('Dosage is required (e.g., "1 tablet", "5ml")');
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('Total quantity must be greater than 0');
      return;
    }

    onSave({
      medicine_name: name.trim(),
      dosage: dosage.trim(),
      quantity: Number(quantity),
      low_stock_threshold: Number(lowStockThreshold || 10),
      schedule_type: scheduleType,
      schedule_days: scheduleDays.trim(),
      frequency: frequency.trim() || 'Morning',
      start_date: startDate,
      notes: notes.trim(),
      ...(editMedicine ? { remaining_quantity: refillStock ? Number(quantity) : editMedicine.remaining_quantity } : {})
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">
            {editMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 border-b border-slate-100">
          <PrescriptionUpload onExtractedText={handleExtractedText} />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-500">Medicine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paracetamol"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-500">Dosage</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-500">Total Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="e.g. 30"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-500">Schedule Type</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="twice_daily">Twice Daily</option>
                <option value="three_times_daily">Three times Daily</option>
                <option value="alternate_days">Alternate Days</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            {(scheduleType === 'weekly' || scheduleType === 'custom') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase text-slate-500">Specific Days</label>
                <input
                  type="text"
                  value={scheduleDays}
                  onChange={(e) => setScheduleDays(e.target.value)}
                  placeholder="e.g. Mon, Wed, Fri"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-500">Low Stock Alert at</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {estimatedDays > 0 && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex justify-between items-center">
              <span className="text-sm font-medium text-indigo-800">Estimated duration:</span>
              <span className="text-sm font-bold text-indigo-700">~{estimatedDays} days</span>
            </div>
          )}

          {editMedicine && (
            <div className="flex items-center gap-2.5 p-3 bg-indigo-50/50 border border-indigo-100/80 rounded-xl">
              <input
                type="checkbox"
                id="refillStock"
                checked={refillStock}
                onChange={(e) => setRefillStock(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="refillStock" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
                Refill remaining stock to match Total Quantity ({quantity} tablets)
              </label>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-500">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take after food"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[70px]"
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            Save Medicine
          </button>
        </div>
      </div>
    </div>
  );
};
