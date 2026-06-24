import React, { useState, useEffect } from 'react';
import { Medicine, ScheduleType, Language, TranslationDict } from '../types';
import { X, Sunrise, Sun, Moon, Info } from 'lucide-react';
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

  // Calculate estimated days
  const [estimatedDays, setEstimatedDays] = useState(0);

  useEffect(() => {
    if (quantity && quantity > 0) {
      let dosesPerDay = 3; // morning, afternoon, night = 3 doses per day
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
  }, [quantity, dosage]);

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
    } else {
      setName('');
      setDosage('1 tablet');
      setQuantity('');
      setLowStockThreshold(10);
      setScheduleType('daily');
      setScheduleDays('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setNotes('');
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

    onSave({
      medicine_name: name.trim(),
      dosage: dosage.trim(),
      quantity: Number(quantity),
      low_stock_threshold: Number(lowStockThreshold || 10),
      schedule_type: scheduleType,
      schedule_days: scheduleDays.trim(),
      frequency: 'Morning, Afternoon, Night',
      start_date: startDate,
      notes: notes.trim(),
      ...(editMedicine ? { remaining_quantity: editMedicine.remaining_quantity } : {})
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-600 border border-rose-100 rounded-xl">
              {error}
            </div>
          )}

          {/* Informational Message */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-3">
            <Info className="text-indigo-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-semibold text-indigo-800 leading-relaxed">
              Every medicine is automatically scheduled for Morning, Afternoon, and Night.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Medicine Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter medicine name"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Total Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Enter quantity / total stock"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                min="1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Alert</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="When stock is low"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                min="1"
              />
            </div>
          </div>

          {estimatedDays > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center animate-fade-in">
              <span className="text-xs font-semibold text-emerald-800">Estimated duration:</span>
              <span className="text-xs font-bold text-emerald-700">~{estimatedDays} days (3 doses/day)</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] font-medium text-slate-800"
            />
          </div>

          {/* Automatic Schedule Visualization */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider text-center">Automatically Scheduled For</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2.5 bg-white border border-emerald-100 rounded-lg shadow-sm">
                <Sunrise size={20} className="text-amber-500 mb-1" />
                <span className="text-xs font-bold text-slate-700">Morning</span>
              </div>
              <div className="flex flex-col items-center p-2.5 bg-white border border-emerald-100 rounded-lg shadow-sm">
                <Sun size={20} className="text-sky-500 mb-1" />
                <span className="text-xs font-bold text-slate-700">Afternoon</span>
              </div>
              <div className="flex flex-col items-center p-2.5 bg-white border border-emerald-100 rounded-lg shadow-sm">
                <Moon size={20} className="text-indigo-500 mb-1" />
                <span className="text-xs font-bold text-slate-700">Night</span>
              </div>
            </div>
            <p className="text-[11px] text-center font-medium text-emerald-700 leading-normal">
              This medicine will automatically appear in Morning, Afternoon, and Night schedules.
            </p>
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
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            Save Medicine
          </button>
        </div>
      </div>
    </div>
  );
};
