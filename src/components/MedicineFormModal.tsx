import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Medicine } from '../types';
import { useMedicines } from '../contexts/MedicineContext';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicineToEdit?: Medicine | null;
}

export default function MedicineFormModal({ isOpen, onClose, medicineToEdit }: MedicineFormModalProps) {
  const { addMedicine, updateMedicine } = useMedicines();
  const [name, setName] = useState('');
  const [totalTablets, setTotalTablets] = useState<number | ''>('');
  const [dosagePerTime, setDosagePerTime] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [schedule, setSchedule] = useState<string[]>(['Morning']);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicineToEdit) {
      setName(medicineToEdit.name);
      setTotalTablets(medicineToEdit.totalTablets);
      setDosagePerTime(medicineToEdit.dosagePerTime);
      setStartDate(medicineToEdit.startDate);
      setSchedule(medicineToEdit.schedule || []);
      setNotes(medicineToEdit.notes || '');
    } else {
      setName('');
      setTotalTablets('');
      setDosagePerTime('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setSchedule(['Morning']);
      setNotes('');
    }
  }, [medicineToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddScheduleTime = () => {
    setSchedule([...schedule, 'Afternoon']);
  };

  const handleRemoveScheduleTime = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = value;
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        name,
        totalTablets: Number(totalTablets),
        dosagePerTime: Number(dosagePerTime),
        startDate,
        schedule: schedule.filter(s => s.trim() !== ''),
        notes
      };

      if (medicineToEdit) {
        await updateMedicine(medicineToEdit.id, payload);
      } else {
        await addMedicine(payload);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving medicine", error);
      alert("Failed to save medicine. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {medicineToEdit ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="medicine-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Stock (Tablets) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalTablets}
                  onChange={(e) => setTotalTablets(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 30"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosage (per time) *</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={dosagePerTime}
                  onChange={(e) => setDosagePerTime(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">Daily Schedule (Times) *</label>
                <button
                  type="button"
                  onClick={handleAddScheduleTime}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Time
                </button>
              </div>
              
              <div className="space-y-2">
                {schedule.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={time}
                      onChange={(e) => handleScheduleChange(index, e.target.value)}
                      placeholder="e.g. Morning or 08:00 AM"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                    {schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScheduleTime(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Take after meals"
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="medicine-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Save Medicine'}
          </button>
        </div>
      </div>
    </div>
  );
}
