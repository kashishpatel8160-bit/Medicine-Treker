import { 
  Home, Pill, Bell, FileText, Activity, BarChart2, Users, Settings, ChevronDown 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  user: any;
}

export function Sidebar({ user }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Medicines', icon: Pill, path: '/dashboard/medicines' },
    { name: 'Reminders', icon: Bell, path: '/dashboard/reminders' },
    { name: 'Prescriptions', icon: FileText, path: '/dashboard/prescriptions' },
    { name: 'Health Records', icon: Activity, path: '/dashboard/health-records' },
    { name: 'Reports', icon: BarChart2, path: '/dashboard/reports' },
    { name: 'Family Members', icon: Users, path: '/dashboard/family' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 fixed h-screen flex flex-col z-20">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white transform -rotate-12">
            <Pill size={18} className="transform rotate-12" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 leading-tight block tracking-tight">Medicine</span>
            <span className="font-semibold text-[13px] text-blue-600 leading-tight block">Tracker</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={idx}
              to={item.path}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-colors ${
                isActive 
                  ? 'bg-[#EFF4FF] text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Promo Card */}
      <div className="px-4 pb-4">
        <div className="bg-[#EFF4FF] rounded-2xl p-5 text-center relative">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-14 bg-white rounded-xl shadow-sm border border-blue-100 flex items-center justify-center relative">
               <Bell size={20} className="text-pink-400 absolute -right-2 -top-2 bg-white rounded-full p-0.5" />
               <div className="w-6 h-10 border-2 border-blue-50 rounded-md"></div>
            </div>
          </div>
          <h4 className="font-extrabold text-slate-900 text-[14px] mb-1">Never miss a dose!</h4>
          <p className="text-[12px] text-slate-500 mb-4 font-medium leading-relaxed">Enable notifications and stay on track.</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-3 rounded-2xl transition-colors shadow-sm">
            Enable Now
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-blue-600 font-bold bg-[#EFF4FF] w-full h-full flex items-center justify-center">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-[14px] font-bold text-slate-900 leading-tight truncate">{user?.name || 'Amit Kumar'}</p>
              <p className="text-[12px] text-slate-500 font-medium truncate">{user?.email || 'amit@example.com'}</p>
            </div>
          </div>
          <ChevronDown size={16} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
