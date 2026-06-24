import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { Sidebar } from '../components/dashboard/Sidebar';
import { PageHeader } from '../components/dashboard/PageHeader';
import { PrescriptionCard } from '../components/dashboard/PrescriptionCard';
import { UploadPrescriptionCard } from '../components/dashboard/UploadPrescriptionCard';
import { OCRWizard } from '../components/OCRWizard';
import { MultiMedicineForm } from '../components/MultiMedicineForm';
import { X } from 'lucide-react';

export default function Prescriptions() {
  const { user } = useAuth();
  const { medicines, addMedicine } = useMedicines();
  
  const [isOcrWizardOpen, setIsOcrWizardOpen] = useState(false);
  const [isMultiFormOpen, setIsMultiFormOpen] = useState(false);
  const [ocrExtractedNames, setOcrExtractedNames] = useState<string[]>([]);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // We are extracting "prescriptions" from medicines that have a prescription_image
  // In a real app, you might have a dedicated table for Prescriptions.
  const prescriptions = medicines
    .filter(med => med.prescription_image)
    .map(med => ({
      id: med.id,
      medicine_name: med.medicine_name,
      doctorName: 'Dr. Smith', // Mocked as we don't store doctor name yet
      issueDate: new Date(med.created_at).toLocaleDateString(),
      expiryDate: new Date(new Date(med.created_at).getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Mocked 6 months later
      fileType: 'image', // Assuming image for OCR
      imageUrl: med.prescription_image,
      status: 'Active' // Mocked status
    }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      <Sidebar user={user} />
      
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen pb-10">
        <PageHeader 
          title="Prescriptions" 
          subtitle="Manage your medical documents and prescriptions." 
          user={user} 
        />
        
        <div className="px-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Upload Card */}
            <UploadPrescriptionCard onClick={() => setIsOcrWizardOpen(true)} />
            
            {/* Document Cards */}
            {prescriptions.map(prescription => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription} 
                onView={() => setPreviewImage(prescription.imageUrl || null)}
              />
            ))}
          </div>
          
          {prescriptions.length === 0 && (
             <div className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50 text-center">
               <p className="text-slate-500 font-medium">You don't have any saved prescriptions yet.</p>
             </div>
          )}
        </div>
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
            setIsMultiFormOpen(false);
            setOcrExtractedNames([]);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white absolute top-0 left-0 right-0 z-10">
              <h3 className="font-bold text-slate-900">Document Preview</h3>
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-8 mt-[64px] flex items-center justify-center">
              <img src={previewImage} alt="Prescription Preview" className="max-w-full h-auto rounded-xl shadow-sm border border-slate-200 object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
