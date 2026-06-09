import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMedicines } from '../contexts/MedicineContext';
import { 
  LogOut, 
  Activity, 
  HeartPulse, 
  Plus, 
  TrendingUp, 
  Calendar,
  Clock,
  User as UserIcon,
  Bell
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { medicines } = useMedicines();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <HeartPulse size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                HealthSync
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors">
                <Bell size={20} />
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
              Here is your daily health overview.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
            <Plus size={20} />
            Log Reading
          </button>
        </section>

        {/* Top Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Latest BP Update Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-red-50 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                <Activity size={24} />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} /> Normal
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Latest Blood Pressure</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold tracking-tight text-slate-800">120<span className="text-2xl text-slate-400 font-medium">/80</span></h3>
                <span className="text-sm font-medium text-slate-500">mmHg</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Clock size={12} /> Today at 8:30 AM
              </p>
            </div>
          </div>

          {/* Heart Rate Stats Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-orange-50 opacity-50 group-hover:scale-110 transition-transform"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                <HeartPulse size={24} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Resting Heart Rate</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold tracking-tight text-slate-800">72</h3>
                <span className="text-sm font-medium text-slate-500">bpm</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Calendar size={12} /> Last 7 Days Avg
              </p>
            </div>
          </div>

          {/* Active Medicines Card */}
          <Link to="/dashboard/medicine-tracker" className="block group">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-md text-white relative overflow-hidden h-full group-hover:shadow-lg group-hover:scale-[1.02] transition-all cursor-pointer">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-indigo-200 font-medium text-sm mb-1">Active Prescriptions</p>
                    <div className="bg-indigo-500/50 p-2 rounded-lg group-hover:bg-indigo-500 transition-colors">
                      <Plus size={16} />
                    </div>
                  </div>
                  <h3 className="text-5xl font-extrabold">{medicines?.length || 0}</h3>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-indigo-900/50 rounded-full h-2 mb-2 overflow-hidden">
                    <div className="bg-indigo-300 h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-xs text-indigo-200 flex items-center justify-between">
                    <span>75% adherence this week</span>
                    <span className="font-semibold text-white group-hover:underline">Manage Tracker &rarr;</span>
                  </p>
                </div>
              </div>
            </div>
          </Link>

        </section>

        {/* History / Recent Readings Section */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent History</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>
          
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reading</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                     Today, 8:30 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">Blood Pressure</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">120/80 <span className="text-xs text-slate-400 font-normal">mmHg</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Normal</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                     Yesterday, 7:45 PM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">Blood Pressure</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">125/82 <span className="text-xs text-slate-400 font-normal">mmHg</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Normal</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                     Yesterday, 8:00 AM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">Heart Rate</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">75 <span className="text-xs text-slate-400 font-normal">bpm</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Normal</span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Empty State Example (Hidden normally) */}
            {false && (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Activity className="text-slate-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No readings yet</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-6">Start tracking your health by logging your first blood pressure or heart rate reading.</p>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
                  Log First Reading
                </button>
              </div>
            )}
            
          </div>
        </section>

      </main>
    </div>
  );
}
