import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PageHeader } from '../components/dashboard/PageHeader';
import { X, FileText, Download, Eye, Trash2, UploadCloud, Search } from 'lucide-react';

interface PrescriptionDoc {
  id: string;
  fileName: string;
  uploadDate: string;
  fileData: string; // Base64 data URL
  fileType: 'pdf' | 'image';
}

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<PrescriptionDoc | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('healthsync_prescriptions');
      if (stored) {
        setPrescriptions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load prescriptions from localStorage', e);
    }
  }, []);

  // Save to LocalStorage
  const savePrescriptions = (updated: PrescriptionDoc[]) => {
    setPrescriptions(updated);
    try {
      localStorage.setItem('healthsync_prescriptions', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save prescriptions to localStorage', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        const newDoc: PrescriptionDoc = {
          id: Math.random().toString(36).substring(2, 9) + Date.now(),
          fileName: file.name,
          uploadDate: new Date().toLocaleDateString(),
          fileData: dataUrl,
          fileType: isPdf ? 'pdf' : 'image'
        };

        savePrescriptions([newDoc, ...prescriptions]);
      };
      
      reader.readAsDataURL(file);
    }
    // reset file input
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this prescription?")) {
      const updated = prescriptions.filter(p => p.id !== id);
      savePrescriptions(updated);
    }
  };

  // Filtered list
  const filteredPrescriptions = prescriptions.filter(pres => 
    pres.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <PageHeader 
        title="Prescriptions" 
        subtitle="Manage, preview, and download your uploaded prescriptions." 
        user={user} 
      />
      
      <div className="flex flex-col gap-6">
        {/* Upload Container & Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Drag & Drop Upload Zone */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border-2 border-dashed border-blue-200 dark:border-slate-800 rounded-3xl p-8 hover:border-blue-400 dark:hover:border-blue-900 hover:bg-blue-50/20 dark:hover:bg-slate-950/20 transition-all flex flex-col items-center justify-center text-center relative group min-h-[220px]">
            <input 
              type="file" 
              id="file-upload" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept=".pdf,.png,.jpg,.jpeg" 
              multiple 
              onChange={handleFileUpload}
            />
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <UploadCloud size={30} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Upload New Prescriptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 max-w-[280px]">
              Drag and drop your PDF, PNG, or JPG files here, or click to browse.
            </p>
          </div>

          {/* Search Filter Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">Search Document</h3>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold mt-4">
              Supported file types: PDF, PNG, JPG. Total documents stored: {prescriptions.length}
            </p>
          </div>

        </div>

        {/* Prescription List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-5 border-b border-slate-50 dark:border-slate-850 pb-3">Prescription Directory</h3>
          
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium text-xs">
              {searchQuery ? "No matching prescriptions found." : "No prescriptions uploaded yet. Use the upload card above to save medical documents."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {filteredPrescriptions.map(pres => (
                <div key={pres.id} className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 hover:border-blue-100 dark:hover:border-blue-900 transition-colors flex flex-col group">
                  
                  {/* File Metadata */}
                  <div className="flex gap-3 mb-4 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      pres.fileType === 'pdf' ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' : 'bg-blue-50 text-blue-500 dark:bg-blue-950/30'
                    }`}>
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate leading-tight" title={pres.fileName}>
                        {pres.fileName}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                        Uploaded: {pres.uploadDate}
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail / Preview Area */}
                  <div className="bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-150 dark:border-slate-800 mb-4 shrink-0">
                    {pres.fileType === 'pdf' ? (
                      <div className="flex flex-col items-center gap-1.5 text-rose-500">
                        <FileText size={32} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">PDF Document</span>
                      </div>
                    ) : (
                      <img src={pres.fileData} alt={pres.fileName} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center gap-2">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {pres.fileType}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDoc(pres)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        title="View Prescription"
                      >
                        <Eye size={14} />
                      </button>
                      <a
                        href={pres.fileData}
                        download={pres.fileName}
                        className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors inline-block"
                        title="Download File"
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => handleDelete(pres.id)}
                        className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-450 dark:hover:bg-rose-900/50 rounded-lg transition-colors"
                        title="Delete Prescription"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* High Fidelity Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 absolute top-0 left-0 right-0 z-10">
              <div className="min-w-0 pr-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{previewDoc.fileName}</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Uploaded on {previewDoc.uploadDate}</p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 mt-[64px] flex items-center justify-center min-h-[300px]">
              {previewDoc.fileType === 'pdf' ? (
                <div className="text-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm max-w-md w-full">
                  <FileText className="text-rose-500 mx-auto mb-3" size={48} />
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">PDF Document Preview</h4>
                  <p className="text-xs text-slate-550 dark:text-slate-400 font-medium mb-5">
                    Web preview is not supported for PDFs. Please download the file to view its full contents.
                  </p>
                  <a
                    href={previewDoc.fileData}
                    download={previewDoc.fileName}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Download size={14} /> Download PDF
                  </a>
                </div>
              ) : (
                <img 
                  src={previewDoc.fileData} 
                  alt={previewDoc.fileName} 
                  className="max-w-full max-h-[60vh] rounded-2xl shadow-md border border-slate-200 dark:border-slate-850 object-contain" 
                />
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
