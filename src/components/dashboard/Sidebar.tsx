import { 
  Home, Pill, Bell, FileText, X, LogOut, History, Settings 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Medicines', icon: Pill, path: '/dashboard/medicines' },
    { name: 'Reminders', icon: Bell, path: '/dashboard/reminders' },
    { name: 'Prescriptions', icon: FileText, path: '/dashboard/prescriptions' },
    { name: 'History', icon: History, path: '/dashboard/history' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await logout();
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
  };

  return (
    <aside className={`w-[260px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 fixed h-screen flex flex-col z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white transform -rotate-12">
            <Pill size={18} className="transform rotate-12" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight block tracking-tight">Medicine</span>
            <span className="font-semibold text-[13px] text-blue-600 leading-tight block">Tracker</span>
          </div>
        </Link>
        {/* Close button for mobile drawer */}
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={idx}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Promo Card (hidden on smaller screen widths) */}
      <div className="px-4 pb-4 hidden lg:block">
        <div className="bg-[#EFF4FF] dark:bg-blue-950/20 rounded-2xl p-5 text-center relative border border-blue-50/50 dark:border-blue-900/20">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 flex items-center justify-center relative">
               <Bell size={20} className="text-pink-400 absolute -right-2 -top-2 bg-white dark:bg-slate-800 rounded-full p-0.5" />
               <div className="w-6 h-10 border-2 border-blue-50 dark:border-slate-700 rounded-md"></div>
            </div>
          </div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-[14px] mb-1">Never miss a dose!</h4>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4 font-medium leading-relaxed">Stay on track with notifications.</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-3 rounded-2xl transition-colors shadow-sm">
            Enable Now
          </button>
        </div>
      </div>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-2xl transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-blue-600 font-bold bg-[#EFF4FF] dark:bg-blue-950 w-full h-full flex items-center justify-center">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <div className="text-left min-w-0">
              <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight truncate">{user?.name || 'Amit Kumar'}</p>
              <p className="text-[12px] text-slate-550 dark:text-slate-400 font-medium truncate">{user?.email || 'amit@example.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
