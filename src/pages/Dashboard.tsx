import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { Medicine } from '../types';
import { 
  LogOut, 
  Plus, 
  Calendar,
  Clock,
  User as UserIcon,
  Bell,
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { medicines, markTaken } = useMedicines();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const currentDayNameShort = useMemo(() => format(new Date(), 'E'), []); // e.g., 'Mon'

  // Refill alerts: remaining stock <= low_stock_threshold
  const lowStockMedicines = medicines.filter(m => m.remaining_quantity <= (m.low_stock_threshold || 10));

  // Determine Today's Medicines
  const todayMedicines = medicines.filter(med => {
    if (med.schedule_type === 'daily' || med.schedule_type === 'twice_daily' || med.schedule_type === 'three_times_daily') return true;
    if (med.schedule_type === 'weekly' || med.schedule_type === 'custom') {
      if (!med.schedule_days) return false;
      return med.schedule_days.toLowerCase().includes(currentDayNameShort.toLowerCase());
    }
    return true; // For alternate_days or monthly, simplify to true for display unless strict logic added
  });

  // Calculate missed doses today
  const missedDoses = medicines.flatMap(med => {
    const todayLogs = med.logs?.filter(l => l.date === todayStr && l.status === 'missed') || [];
    return todayLogs.map(l => ({ medicine: med, log: l }));
  });

  // Recent Prescriptions (Last 5 added)
  const recentPrescriptions = [...medicines]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getDoseStatusToday = (medicine: Medicine, timeSlot: string) => {
    const log = medicine.logs?.find(l => l.date === todayStr && l.timeSlot === timeSlot);
    return log?.status; // 'taken', 'missed', or undefined
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Pill size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                MediTrack
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors relative">
                <Bell size={20} />
                {lowStockMedicines.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-200">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || <UserIcon size={16} />
                )}
              </div>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="mt-1 text-slate-500 font-medium">
              Here is your daily medication overview.
            </p>
          </div>
          <Link to="/dashboard/medicine-tracker" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
            <Plus size={20} />
            Manage Medicines
          </Link>
        </section>

        {/* Top Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-50 opacity-50"></div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl w-max mb-4 relative z-10">
              <Pill size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Today's Medicines</p>
              <h3 className="text-4xl font-extrabold tracking-tight text-slate-800">{todayMedicines.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-blue-50 opacity-50"></div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl w-max mb-4 relative z-10">
              <Calendar size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Prescriptions</p>
              <h3 className="text-4xl font-extrabold tracking-tight text-slate-800">{medicines.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-rose-50 opacity-50"></div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl w-max mb-4 relative z-10">
              <XCircle size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Missed Today</p>
              <h3 className="text-4xl font-extrabold tracking-tight text-slate-800">{missedDoses.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-amber-50 opacity-50"></div>
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl w-max mb-4 relative z-10">
              <AlertTriangle size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Low Stock</p>
              <h3 className="text-4xl font-extrabold tracking-tight text-slate-800">{lowStockMedicines.length}</h3>
            </div>
          </div>

        </section>

        {/* Layout grid for tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Today's Schedule & Low Stock */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Low Stock Alerts Section */}
            {lowStockMedicines.length > 0 && (
              <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-amber-600" size={24} />
                  <h2 className="text-lg font-bold text-amber-900">Low Stock Alerts</h2>
                </div>
                <div className="space-y-3">
                  {lowStockMedicines.map(med => (
                    <div key={med.id} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800">{med.medicine_name}</h4>
                        <p className="text-sm text-amber-600 font-medium">Only {med.remaining_quantity} left</p>
                      </div>
                      <Link to="/dashboard/medicine-tracker" className="text-sm font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200">
                        Restock
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Today's Schedule Section */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={20} className="text-indigo-500" />
                  Today's Medicines
                </h2>
              </div>
              
              <div className="p-0">
                {todayMedicines.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Pill className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Nothing scheduled for today!</h3>
                    <p className="text-slate-500 text-sm max-w-sm">You have no medicines scheduled for {currentDayNameShort}.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {todayMedicines.map((med) => {
                      const frequencySlots = med.frequency.split(',').map(f => f.trim());
                      return (
                        <li key={med.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <Pill size={20} />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-slate-800 leading-tight">{med.medicine_name}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{med.dosage} • {med.quantity} total stock</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 mt-3 pl-13">
                            {frequencySlots.map((time, idx) => {
                              const status = getDoseStatusToday(med, time);
                              return (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                                  <span className="font-semibold text-slate-700">{time}</span>
                                  <div className="flex items-center gap-2">
                                    {status === 'taken' ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                                        <CheckCircle size={16} /> Taken
                                      </span>
                                    ) : status === 'missed' ? (
                                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-sm font-semibold">
                                        <XCircle size={16} /> Missed
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => markTaken(med.id, time, 'taken', todayStr)}
                                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 border border-emerald-200"
                                        >
                                          <CheckCircle size={14} /> Mark Taken
                                        </button>
                                        <button 
                                          onClick={() => markTaken(med.id, time, 'missed', todayStr)}
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
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Column: Recent Prescriptions & Missed */}
          <div className="space-y-8">
            
            {/* Missed Doses Summary */}
            {missedDoses.length > 0 && (
              <section className="bg-white rounded-3xl border border-rose-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-rose-100 bg-rose-50 flex items-center gap-2">
                  <XCircle className="text-rose-500" size={18} />
                  <h3 className="font-bold text-rose-800">Missed Today</h3>
                </div>
                <div className="p-4 space-y-3">
                  {missedDoses.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <span className="font-semibold text-slate-700">{m.medicine.medicine_name}</span>
                      <span className="text-slate-500">{m.log.timeSlot}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recent Prescriptions */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <FileText className="text-indigo-500" size={18} />
                <h3 className="font-bold text-slate-800">Recent Prescriptions</h3>
              </div>
              <div className="p-0">
                {recentPrescriptions.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">No prescriptions added yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {recentPrescriptions.map(med => (
                      <li key={med.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{med.medicine_name}</h4>
                            <p className="text-xs text-slate-500">{new Date(med.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                            {med.remaining_quantity} left
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <Link to="/dashboard/medicine-tracker" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1">
                    Manage All <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

const ArrowRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);
