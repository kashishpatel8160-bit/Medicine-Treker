import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PageHeader } from '../components/dashboard/PageHeader';
import { MedicineCard } from '../components/dashboard/MedicineCard';
import { MedicineForm } from '../components/MedicineForm';
import { Medicine } from '../types';
import { Plus } from 'lucide-react';

export default function Medicines() {
  const { user } = useAuth();
  const { medicines, removeMedicine, updateMedicine, addMedicine } = useMedicines();
  
  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  const categories = ['All', 'Tablets', 'Syrup', 'Capsules', 'Injection'];
  const statuses = ['All', 'Active', 'Low Stock', 'Completed'];

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

  const handleSaveMedicine = async (medData: any) => {
    try {
      if (medicineToEdit) {
        await updateMedicine(medicineToEdit.id, medData);
      } else {
        await addMedicine(medData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save medicine');
    }
  };

  // Mock filtering (assuming dosage contains tablet/syrup or we have a type field)
  const filteredMedicines = medicines.filter(med => {
    let matchesCategory = true;
    if (filter !== 'All') {
      matchesCategory = med.dosage.toLowerCase().includes(filter.toLowerCase().replace(/s$/, ''));
    }
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      const isLowStock = med.remaining_quantity <= med.low_stock_threshold;
      if (statusFilter === 'Active') matchesStatus = !isLowStock && med.remaining_quantity > 0;
      if (statusFilter === 'Low Stock') matchesStatus = isLowStock && med.remaining_quantity > 0;
      if (statusFilter === 'Completed') matchesStatus = med.remaining_quantity === 0;
    }
    
    return matchesCategory && matchesStatus;
  });

  return (
    <DashboardLayout>
      <PageHeader 
        title="Medicines" 
        subtitle="Manage your prescriptions and stock levels." 
        user={user} 
        actions={
          <button 
            onClick={handleAddNew}
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-[14px] font-bold transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Medicine
          </button>
        }
      />
      
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                  filter === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {statuses.map(stat => (
              <button
                key={stat}
                onClick={() => setStatusFilter(stat)}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-colors ${
                  statusFilter === stat 
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>

        {/* Medicines Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-[18px] font-extrabold text-slate-900 dark:text-white mb-2">No medicines found</h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-sm">
              You haven't added any medicines that match these filters.
            </p>
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[14px] font-bold transition-colors shadow-sm"
            >
              Add New Medicine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map(med => (
              <MedicineCard 
                key={med.id} 
                medicine={med} 
                onEdit={() => handleEdit(med)}
                onDelete={() => handleDelete(med.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button 
        onClick={handleAddNew}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-50 animate-bounce-short"
      >
        <Plus size={24} />
      </button>

      <MedicineForm
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveMedicine}
        editMedicine={medicineToEdit} 
      />
    </DashboardLayout>
  );
}
