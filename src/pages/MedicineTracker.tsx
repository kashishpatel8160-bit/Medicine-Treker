import { useState, useMemo } from 'react';
import { useMedicines } from '../contexts/MedicineContext';
import { OCRWizard } from '../components/OCRWizard';
import { MultiMedicineForm } from '../components/MultiMedicineForm';
import { MedicineForm } from '../components/MedicineForm';
import { Medicine } from '../types';
import { 
  ArrowLeft,
  Plus, 
  Pill, 
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileImage,
  Sunrise,
  Sun,
  Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MedicineTracker() {
  const { medicines, removeMedicine, markTaken, loading, addMedicine, updateMedicine, syncError } = useMedicines();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  // OCR Flow states
  const [isOcrWizardOpen, setIsOcrWizardOpen] = useState(false);
  const [isMultiFormOpen, setIsMultiFormOpen] = useState(false);
  const [ocrExtractedNames, setOcrExtractedNames] = useState<string[]>([]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleEdit = (medicine: Medicine) => {
    setMedicineToEdit(medicine);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setMedicineToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      await removeMedicine(id);
    }
  };

  const handleMarkDose = async (medicine: Medicine, timeSlot: string, status: 'taken' | 'missed') => {
    await markTaken(medicine.id, timeSlot, status, todayStr);
  };

  const getDoseStatusToday = (medicine: Medicine, timeSlot: string) => {
    const log = medicine.logs?.find(l => l.date === todayStr && l.timeSlot === timeSlot);
    return log?.status; // 'taken', 'missed', or undefined
  };

  const handleSaveMedicine = async (medData: any) => {
    try {
      if (medicineToEdit) {
        await updateMedicine(medicineToEdit.id, medData);
      } else {
        await addMedicine(medData);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save medicine');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 pb-12">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Pill size={18} />
                </div>
                <span className="font-bold text-lg text-slate-800">
                  Medicine Tracker
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsOcrWizardOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl font-semibold shadow-sm hover:bg-indigo-50 transition-all text-sm"
              >
                <FileImage size={16} />
                <span className="hidden sm:inline">Scan Prescription</span>
              </button>
              <button 
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all text-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Manually</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {syncError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="shrink-0" size={20} />
            <div>
              <p className="font-bold text-sm">Sync Error</p>
              <p className="text-sm">{syncError}</p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Your Prescriptions
          </h1>
          <p className="mt-1 text-slate-500 font-medium">
            Manage your medicines and track your daily doses.
          </p>
        </div>

        {/* Medicines Grid */}
        {loading && medicines.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : medicines.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <Pill size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No medicines added yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Keep track of your prescriptions, dosages, and daily schedules by adding your first medicine.
            </p>
            <button 
              onClick={handleAddNew}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all"
            >
              Add Your First Medicine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {medicines.map(medicine => (
              <div key={medicine.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Pill size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{medicine.medicine_name}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <Clock size={14} /> {medicine.dosage} per dose
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleEdit(medicine)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(medicine.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Card Body - Schedule */}
                <div className="p-5 flex-1">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" /> Schedule: {medicine.schedule_type.replace('_', ' ')}
                  </h4>
                  
                  <div className="space-y-3">
                    {/* For simplicity, map frequency to a single slot. If multiple, we split by comma. */}
                    {medicine.frequency.split(',').map(f => f.trim()).map((time, idx) => {
                      const status = getDoseStatusToday(medicine, time);
                      let TimeIcon = Clock;
                      let bgClass = "bg-white";
                      let iconClass = "text-slate-400";
                      
                      if (time === 'Morning') {
                        TimeIcon = Sunrise;
                        bgClass = "bg-amber-50/50";
                        iconClass = "text-amber-500";
                      } else if (time === 'Day/Afternoon') {
                        TimeIcon = Sun;
                        bgClass = "bg-sky-50/50";
                        iconClass = "text-sky-500";
                      } else if (time === 'Night') {
                        TimeIcon = Moon;
                        bgClass = "bg-indigo-50/50";
                        iconClass = "text-indigo-500";
                      }
                      
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border border-slate-100 shadow-sm ${bgClass}`}>
                          <div className="flex items-center gap-2">
                            <TimeIcon size={18} className={iconClass} />
                            <span className="font-semibold text-slate-700">{time}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {status === 'taken' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                                <CheckCircle2 size={16} /> Taken
                              </span>
                            ) : status === 'missed' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
                                <XCircle size={16} /> Missed
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleMarkDose(medicine, time, 'taken')}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 border border-emerald-200"
                                >
                                  <CheckCircle2 size={14} /> Mark Taken
                                </button>
                                <button 
                                  onClick={() => handleMarkDose(medicine, time, 'missed')}
                                  className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                >
                                  Skip
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer - Stock info */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    {medicine.remaining_quantity <= medicine.low_stock_threshold ? (
                      <>
                        <AlertCircle size={16} className="text-amber-500" />
                        <span className="text-amber-600 font-semibold">Low Stock ({medicine.remaining_quantity} remaining)</span>
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (window.confirm(`Are you sure you want to restock ${medicine.medicine_name} to the full quantity of ${medicine.quantity}?`)) {
                              await updateMedicine(medicine.id, { remaining_quantity: medicine.quantity });
                            }
                          }}
                          className="ml-2 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2.5 py-1 rounded-lg transition-colors border border-amber-200"
                        >
                          Restock
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-emerald-600 font-semibold">In Stock ({medicine.remaining_quantity} remaining)</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    Started {new Date(medicine.start_date).toLocaleDateString()}
                  </span>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </main>

      {/* OCR Flow States */}
      {isOcrWizardOpen && (
        <OCRWizard 
          onClose={() => setIsOcrWizardOpen(false)}
          onConfirm={(names) => {
            setOcrExtractedNames(names);
            setIsOcrWizardOpen(false);
            setIsMultiFormOpen(true);
          }}
        />
      )}

      {isMultiFormOpen && (
        <MultiMedicineForm
          initialNames={ocrExtractedNames}
          onClose={() => {
            setIsMultiFormOpen(false);
            setOcrExtractedNames([]);
          }}
          onSaveAll={async (medicinesList) => {
            for (const med of medicinesList) {
              await addMedicine(med);
            }
          }}
        />
      )}

      <MedicineForm
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveMedicine}
        editMedicine={medicineToEdit} 
      />
    </div>
  );
}
