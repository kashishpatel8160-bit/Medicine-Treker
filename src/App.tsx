import { useState, useEffect, useMemo } from 'react';
import { Medicine, Language } from './types';
import { translations } from './utils/translations';
import { DashboardStats } from './components/DashboardStats';
import { MedicineList } from './components/MedicineList';
import { MedicineDetails } from './components/MedicineDetails';
import { MedicineForm } from './components/MedicineForm';
import { requestNotificationPermission, sendDesktopNotification, playNotificationSound } from './utils/notifications';
import { Plus, Languages, Sun, Moon, Bell, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'upchaar_medicines';
const LANGUAGE_STORAGE_KEY = 'upchaar_language';
const DARK_MODE_STORAGE_KEY = 'upchaar_darkmode';

// Premium Seed data to wow the user at first launch
const getSeedData = (): Medicine[] => {
  const today = new Date();
  
  const dateOffset = (days: number) => {
    const d = new Date();
    d.setDate(today.getDate() - days);
    return d.toLocaleDateString('en-CA');
  };

  const timeOffsetISO = (days: number, hour: number) => {
    const d = new Date();
    d.setDate(today.getDate() - days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'seed-paracetamol',
      name: 'Paracetamol 650mg',
      totalTablets: 30,
      currentStock: 8, // Triggers "Low Stock"
      dosagePerTime: 1,
      schedule: ['Morning', 'Night'],
      startDate: dateOffset(5),
      notes: 'Take after meals. Do not exceed 3 tablets daily. / भोजन के बाद लें।',
      createdAt: timeOffsetISO(5, 8),
      refills: [
        {
          id: 'refill-1',
          date: timeOffsetISO(5, 8),
          quantityAdded: 30,
          notes: 'Initial pharmacy prescription'
        }
      ],
      logs: [
        {
          id: 'log-1',
          date: dateOffset(4),
          timeSlot: 'Morning',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(4, 9)
        },
        {
          id: 'log-2',
          date: dateOffset(4),
          timeSlot: 'Night',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(4, 21)
        },
        {
          id: 'log-3',
          date: dateOffset(3),
          timeSlot: 'Morning',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(3, 8)
        },
        {
          id: 'log-4',
          date: dateOffset(3),
          timeSlot: 'Night',
          status: 'missed',
          tabletsTaken: 0,
          timestamp: timeOffsetISO(3, 22)
        },
        {
          id: 'log-5',
          date: dateOffset(2),
          timeSlot: 'Morning',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(2, 9)
        },
        {
          id: 'log-6',
          date: dateOffset(2),
          timeSlot: 'Night',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(2, 20)
        },
        {
          id: 'log-7',
          date: dateOffset(1),
          timeSlot: 'Morning',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(1, 8)
        }
      ]
    },
    {
      id: 'seed-amoxicillin',
      name: 'Amoxicillin 500mg',
      totalTablets: 15,
      currentStock: 12, // Sufficient Stock
      dosagePerTime: 1,
      schedule: ['Morning', 'Afternoon', 'Night'],
      startDate: dateOffset(2),
      notes: 'Finish full 5-day course. / खुराक पूरी करें।',
      createdAt: timeOffsetISO(2, 10),
      refills: [
        {
          id: 'refill-2',
          date: timeOffsetISO(2, 10),
          quantityAdded: 15,
          notes: 'Started antibiotics course'
        }
      ],
      logs: [
        {
          id: 'log-8',
          date: dateOffset(1),
          timeSlot: 'Morning',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(1, 8)
        },
        {
          id: 'log-9',
          date: dateOffset(1),
          timeSlot: 'Afternoon',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(1, 14)
        },
        {
          id: 'log-10',
          date: dateOffset(1),
          timeSlot: 'Night',
          status: 'taken',
          tabletsTaken: 1,
          timestamp: timeOffsetISO(1, 21)
        }
      ]
    }
  ];
};

export default function App() {
  // Localization & Dark Mode State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return (saved === 'hi' || saved === 'en') ? saved as Language : 'en';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Medicines state
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [notifPermissionGranted, setNotifPermissionGranted] = useState(false);

  // Responsive mobile view tab switcher ('list' | 'details')
  const [mobileTab, setMobileTab] = useState<'list' | 'details'>('list');

  // Load initial data
  useEffect(() => {
    const savedMedicines = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedMedicines) {
      try {
        const parsed = JSON.parse(savedMedicines) as Medicine[];
        setMedicines(parsed);
        if (parsed.length > 0) {
          setSelectedMedId(parsed[0].id);
        }
      } catch (err) {
        console.error('Failed to parse saved medicines, loading seed data.', err);
        const seeds = getSeedData();
        setMedicines(seeds);
        setSelectedMedId(seeds[0].id);
      }
    } else {
      // Setup seed data
      const seeds = getSeedData();
      setMedicines(seeds);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeds));
      if (seeds.length > 0) {
        setSelectedMedId(seeds[0].id);
      }
    }

    // Check browser notification permission status
    if ('Notification' in window) {
      setNotifPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Update HTML elements class when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(DARK_MODE_STORAGE_KEY, String(darkMode));
  }, [darkMode]);

  // Sync medicines changes to LocalStorage and audibly alert if any just dropped below 10 days
  const syncMedicines = (updated: Medicine[]) => {
    setMedicines(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  // Language translator lookup
  const t = useMemo(() => translations[language], [language]);

  // Selected Medicine details binding
  const selectedMedicine = useMemo(() => {
    return medicines.find((m) => m.id === selectedMedId) || null;
  }, [medicines, selectedMedId]);

  // Trigger permission request
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermissionGranted(granted);
    if (granted) {
      sendDesktopNotification('Upchaar / उपचार', 'Notifications successfully enabled! / नोटिफिकेशन सक्षम कर दिए गए हैं!');
      playNotificationSound('success');
    }
  };

  // Add / Update medicine
  const handleSaveMedicine = (formData: Omit<Medicine, 'id' | 'createdAt' | 'refills' | 'logs'> & { id?: string }) => {
    if (formData.id) {
      // Edit existing
      const updated = medicines.map((med) => {
        if (med.id === formData.id) {
          return {
            ...med,
            name: formData.name,
            totalTablets: formData.totalTablets,
            dosagePerTime: formData.dosagePerTime,
            schedule: formData.schedule,
            startDate: formData.startDate,
            notes: formData.notes
          };
        }
        return med;
      });
      syncMedicines(updated);
    } else {
      // Create new
      const newMed: Medicine = {
        id: 'med-' + Date.now(),
        name: formData.name,
        totalTablets: formData.totalTablets,
        currentStock: formData.totalTablets, // Start at full capacity
        dosagePerTime: formData.dosagePerTime,
        schedule: formData.schedule,
        startDate: formData.startDate,
        notes: formData.notes,
        refills: [
          {
            id: 'refill-' + Date.now(),
            date: new Date().toISOString(),
            quantityAdded: formData.totalTablets,
            notes: 'Initial inventory stock'
          }
        ],
        logs: [],
        createdAt: new Date().toISOString()
      };
      
      const updated = [newMed, ...medicines];
      syncMedicines(updated);
      setSelectedMedId(newMed.id);
    }
    setEditingMed(null);
  };

  // Add Stock (Refill)
  const handleRefillStock = (id: string, quantity: number, notes?: string) => {
    const updated = medicines.map((med) => {
      if (med.id === id) {
        const refillRecord = {
          id: 'refill-' + Date.now(),
          date: new Date().toISOString(),
          quantityAdded: quantity,
          notes
        };
        const newStock = med.currentStock + quantity;
        const newTotal = med.totalTablets + quantity; // Add capacity or keep total? Adding capacity is intuitive.
        return {
          ...med,
          currentStock: newStock,
          totalTablets: newTotal,
          refills: [...med.refills, refillRecord]
        };
      }
      return med;
    });
    syncMedicines(updated);
  };

  // Log dose taken / missed
  const handleLogDose = (id: string, timeSlot: string, status: 'taken' | 'missed') => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    
    const updated = medicines.map((med) => {
      if (med.id === id) {
        // Double check log doesn't exist for today to prevent duplicates
        const logExists = med.logs.some(l => l.date === todayStr && l.timeSlot === timeSlot);
        if (logExists) return med;

        const newLog = {
          id: 'log-' + Date.now(),
          date: todayStr,
          timeSlot,
          status,
          tabletsTaken: status === 'taken' ? med.dosagePerTime : 0,
          timestamp: new Date().toISOString()
        };

        const newStock = status === 'taken' ? Math.max(0, med.currentStock - med.dosagePerTime) : med.currentStock;

        // Visual & Desktop warning if stock dips low
        const dailyUsage = med.schedule.length * med.dosagePerTime;
        const daysRemaining = dailyUsage > 0 ? Math.floor(newStock / dailyUsage) : Infinity;

        if (status === 'taken' && daysRemaining <= 10 && daysRemaining > 0) {
          sendDesktopNotification(
            'Low Stock Alert / कम स्टॉक चेतावनी',
            `"${med.name}" is about to finish. Only ${newStock} tablets remaining (${daysRemaining} days left).`
          );
        } else if (status === 'taken' && newStock === 0) {
          sendDesktopNotification(
            'Stock Empty / स्टॉक समाप्त',
            `"${med.name}" is completely finished. Please refill immediately.`
          );
        }

        return {
          ...med,
          currentStock: newStock,
          logs: [...med.logs, newLog]
        };
      }
      return med;
    });
    
    syncMedicines(updated);
  };

  // Undo Dose log
  const handleUndoDose = (id: string, logId: string) => {
    const updated = medicines.map((med) => {
      if (med.id === id) {
        const targetLog = med.logs.find(l => l.id === logId);
        if (!targetLog) return med;

        // Revert stock if it was marked 'taken'
        const restoredStock = targetLog.status === 'taken' 
          ? med.currentStock + targetLog.tabletsTaken 
          : med.currentStock;

        return {
          ...med,
          currentStock: restoredStock,
          logs: med.logs.filter(l => l.id !== logId)
        };
      }
      return med;
    });

    syncMedicines(updated);
    playNotificationSound('success');
  };

  // Delete Medicine
  const handleDeleteMedicine = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id);
    syncMedicines(updated);
    if (selectedMedId === id) {
      setSelectedMedId(updated.length > 0 ? updated[0].id : undefined);
    }
  };

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
  };

  // Selected sidebar handler (forces tab details switch on mobile view)
  const handleSelectMedicine = (med: Medicine) => {
    setSelectedMedId(med.id);
    setMobileTab('details');
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-200">
      
      {/* Upper Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 shadow-sm px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-indigo-200 dark:shadow-none shadow-md">
              💊
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 leading-none">
                {t.appName}
                <Sparkles size={14} className="fill-indigo-500 text-indigo-500 animate-pulse" />
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            {/* Notifications permissions button */}
            {!notifPermissionGranted && (
              <button
                onClick={handleEnableNotifications}
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-450 dark:hover:text-indigo-400 dark:hover:bg-slate-900 transition-all flex items-center gap-1"
                title="Enable Push Notifications"
              >
                <Bell size={18} />
                <span className="text-xs font-bold hidden md:inline">Alerts</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-extrabold"
              title="Change Language / भाषा बदलें"
            >
              <Languages size={15} />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-655 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Theme Toggle"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content body */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
        
        {/* Statistics widget cards */}
        <DashboardStats medicines={medicines} language={language} t={t} />

        {/* Action button on desktop dashboard header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              {t.dashboard}
            </h2>
          </div>
          <button
            onClick={() => {
              setEditingMed(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md hover:brightness-105 active:scale-98 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={16} strokeWidth={2.5} />
            {t.addNewMedicine}
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-slate-200/60 dark:bg-slate-900 p-0.5 rounded-xl gap-0.5 mb-4">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'list'
                ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-450'
            }`}
          >
            {t.medicinesList} ({medicines.length})
          </button>
          <button
            onClick={() => setMobileTab('details')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mobileTab === 'details'
                ? 'bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-450'
            }`}
          >
            Medicine Details
          </button>
        </div>

        {/* Layout Grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          
          {/* Left panel: list of medicines */}
          <div className={`lg:col-span-4 ${mobileTab === 'list' ? 'block' : 'hidden lg:block'}`}>
            <MedicineList
              medicines={medicines}
              selectedId={selectedMedId}
              onSelect={handleSelectMedicine}
              language={language}
              t={t}
            />
          </div>

          {/* Right panel: details visualizer */}
          <div className={`lg:col-span-8 ${mobileTab === 'details' ? 'block' : 'hidden lg:block'}`}>
            <MedicineDetails
              medicine={selectedMedicine}
              onRefill={handleRefillStock}
              onLogDose={handleLogDose}
              onUndoDose={handleUndoDose}
              onEdit={(med) => {
                setEditingMed(med);
                setIsFormOpen(true);
              }}
              onDelete={handleDeleteMedicine}
              language={language}
              t={t}
            />
          </div>
        </div>

      </main>

      {/* Modal form */}
      <MedicineForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMed(null);
        }}
        onSave={handleSaveMedicine}
        editMedicine={editingMed}
        language={language}
        t={t}
      />

    </div>
  );
}
