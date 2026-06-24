import { useState } from 'react';
import { ScheduleType } from '../types';
import { X, ChevronDown, ChevronUp, CheckCircle, Plus } from 'lucide-react';

interface MultiMedicineFormProps {
  initialNames: string[];
  onClose: () => void;
  onSaveAll: (medicines: any[]) => Promise<void>;
}

export function MultiMedicineForm({ initialNames, onClose, onSaveAll }: MultiMedicineFormProps) {
  const [medicines, setMedicines] = useState(
    initialNames.map((name, i) => ({
      id: `temp-${i}`,
      medicine_name: name,
      dosage: '1 tablet',
      quantity: 30,
      low_stock_threshold: 10,
      schedule_type: 'daily' as ScheduleType,
      frequency: 'Morning',
      schedule_days: '',
      start_date: new Date().toISOString().split('T')[0],
      notes: ''
    }))
  );
  
  const [expandedId, setExpandedId] = useState<string | null>(medicines[0]?.id || null);
  const [isSaving, setIsSaving] = useState(false);

  const updateMedicine = (id: string, field: string, value: any) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveAll(medicines);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save medicines.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Multiple Medicines</h3>
            <p className="text-xs text-slate-500">Review and confirm the details for each scanned medicine.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-100/50">
          {medicines.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No medicines to add.</p>
          ) : (
            medicines.map((med, index) => {
              const isExpanded = expandedId === med.id;
              
              return (
                <div key={med.id} className={`bg-white border ${isExpanded ? 'border-indigo-300 shadow-md ring-1 ring-indigo-500/20' : 'border-slate-200 shadow-sm'} rounded-xl overflow-hidden transition-all duration-200`}>
                  {/* Header (Always visible) */}
                  <div 
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => setExpandedId(isExpanded ? null : med.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{med.medicine_name || 'Unnamed Medicine'}</h4>
                        <p className="text-xs text-slate-500">{med.dosage} • {med.schedule_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMedicine(med.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Body (Expanded) */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase text-slate-500">Medicine Name</label>
                          <input
                            type="text"
                            value={med.medicine_name}
                            onChange={(e) => updateMedicine(med.id, 'medicine_name', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase text-slate-500">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase text-slate-500">Schedule Type</label>
                          <select
                            value={med.schedule_type}
                            onChange={(e) => updateMedicine(med.id, 'schedule_type', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        
                        {(med.schedule_type === 'weekly' || med.schedule_type === 'custom') && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-slate-500">Specific Days</label>
                            <input
                              type="text"
                              value={med.schedule_days}
                              onChange={(e) => updateMedicine(med.id, 'schedule_days', e.target.value)}
                              placeholder="e.g. Mon, Wed, Fri"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        )}
                      </div>


                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase text-slate-500">Total Quantity</label>
                          <input
                            type="number"
                            value={med.quantity}
                            onChange={(e) => updateMedicine(med.id, 'quantity', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase text-slate-500">Low Stock Alert</label>
                          <input
                            type="number"
                            value={med.low_stock_threshold}
                            onChange={(e) => updateMedicine(med.id, 'low_stock_threshold', parseInt(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase text-slate-500">Start Date</label>
                          <input
                            type="date"
                            value={med.start_date}
                            onChange={(e) => updateMedicine(med.id, 'start_date', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          <button 
            onClick={() => setMedicines(prev => [...prev, {
              id: `temp-${Date.now()}`,
              medicine_name: '',
              dosage: '1 tablet',
              quantity: 30,
              low_stock_threshold: 10,
              schedule_type: 'daily',
              frequency: 'Morning',
              schedule_days: '',
              start_date: new Date().toISOString().split('T')[0],
              notes: ''
            }])}
            className="w-full flex justify-center items-center gap-2 py-3 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-semibold text-sm"
          >
            <Plus size={16} /> Add Another Medicine Manually
          </button>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center">
          <button onClick={onClose} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={isSaving || medicines.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
          >
            {isSaving ? 'Saving...' : `Save ${medicines.length} Medicines`}
            {!isSaving && <CheckCircle size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
