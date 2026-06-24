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
  const [fixedFrequency, setFixedFrequency] = useState<string>('Morning');

  // OCR Flow states
  const [isOcrWizardOpen, setIsOcrWizardOpen] = useState(false);
  const [isMultiFormOpen, setIsMultiFormOpen] = useState(false);
  const [ocrExtractedNames, setOcrExtractedNames] = useState<string[]>([]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleEdit = (medicine: Medicine) => {
    setMedicineToEdit(medicine);
    setFixedFrequency(medicine.frequency);
    setIsModalOpen(true);
  };

  const handleAddNew = (slot: string = 'Morning') => {
    setMedicineToEdit(null);
    setFixedFrequency(slot);
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
                onClick={() => handleAddNew('Morning')}
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
              onClick={() => handleAddNew('Morning')}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all"
            >
              Add Your First Medicine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Morning Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
                  <Sunrise size={24} className="text-amber-500" />
                  Morning
                </h2>
                <button onClick={() => handleAddNew('Morning')} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Add Morning Medicine">
                  <Plus size={20} />
                </button>
              </div>
              <div className="p-4 flex-1 space-y-4 bg-slate-50">
                {medicines.filter(m => m.frequency.includes('Morning')).length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No morning medicines</p>
                ) : (
                  medicines.filter(m => m.frequency.includes('Morning')).map(medicine => (
                    <MedicineCard key={medicine.id} medicine={medicine} onEdit={() => handleEdit(medicine)} onDelete={() => handleDelete(medicine.id)} onMark={(status: 'taken' | 'missed') => handleMarkDose(medicine, 'Morning', status)} status={getDoseStatusToday(medicine, 'Morning')} onRestock={async () => await updateMedicine(medicine.id, { remaining_quantity: medicine.quantity })} />
                  ))
                )}
              </div>
            </div>

            {/* Afternoon Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-sky-100 bg-sky-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-sky-800 flex items-center gap-2">
                  <Sun size={24} className="text-sky-500" />
                  Afternoon
                </h2>
                <button onClick={() => handleAddNew('Afternoon')} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors" title="Add Afternoon Medicine">
                  <Plus size={20} />
                </button>
              </div>
              <div className="p-4 flex-1 space-y-4 bg-slate-50">
                {medicines.filter(m => m.frequency.includes('Afternoon') || m.frequency.includes('Day/Afternoon')).length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No afternoon medicines</p>
                ) : (
                  medicines.filter(m => m.frequency.includes('Afternoon') || m.frequency.includes('Day/Afternoon')).map(medicine => (
                    <MedicineCard key={medicine.id} medicine={medicine} onEdit={() => handleEdit(medicine)} onDelete={() => handleDelete(medicine.id)} onMark={(status: 'taken' | 'missed') => handleMarkDose(medicine, 'Afternoon', status)} status={getDoseStatusToday(medicine, 'Afternoon')} onRestock={async () => await updateMedicine(medicine.id, { remaining_quantity: medicine.quantity })} />
                  ))
                )}
              </div>
            </div>

            {/* Night Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-indigo-100 bg-indigo-50/50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                  <Moon size={24} className="text-indigo-500" />
                  Night
                </h2>
                <button onClick={() => handleAddNew('Night')} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" title="Add Night Medicine">
                  <Plus size={20} />
                </button>
              </div>
              <div className="p-4 flex-1 space-y-4 bg-slate-50">
                {medicines.filter(m => m.frequency.includes('Night')).length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">No night medicines</p>
                ) : (
                  medicines.filter(m => m.frequency.includes('Night')).map(medicine => (
                    <MedicineCard key={medicine.id} medicine={medicine} onEdit={() => handleEdit(medicine)} onDelete={() => handleDelete(medicine.id)} onMark={(status: 'taken' | 'missed') => handleMarkDose(medicine, 'Night', status)} status={getDoseStatusToday(medicine, 'Night')} onRestock={async () => await updateMedicine(medicine.id, { remaining_quantity: medicine.quantity })} />
                  ))
                )}
              </div>
            </div>
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
        fixedFrequency={fixedFrequency}
      />
    </div>
  );
}

function MedicineCard({ medicine, onEdit, onDelete, onMark, status, onRestock }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Pill size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">{medicine.medicine_name}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock size={12} /> {medicine.dosage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'taken' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                <CheckCircle2 size={14} /> Taken
              </span>
            ) : status === 'missed' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                <XCircle size={14} /> Missed
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => onMark('taken')} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 size={12} /> Take
                </button>
                <button onClick={() => onMark('missed')} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors">
                  Skip
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {medicine.remaining_quantity <= medicine.low_stock_threshold ? (
            <>
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-amber-600 font-semibold">Low ({medicine.remaining_quantity})</span>
              <button onClick={(e) => { e.preventDefault(); if (window.confirm('Restock?')) onRestock(); }} className="ml-1 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded transition-colors border border-amber-200">
                Restock
              </button>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-600 font-semibold">In Stock ({medicine.remaining_quantity})</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
