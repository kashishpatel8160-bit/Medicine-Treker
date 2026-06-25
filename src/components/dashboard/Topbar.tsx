import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface TopbarProps {
  user: any;
  onMenuToggle: () => void;
}

export function Topbar({ user, onMenuToggle }: TopbarProps) {
  const { logout } = useAuth();

  return (
    <header className="px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 z-30 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4 flex-1">
        {/* Hamburger Menu Trigger */}
        <button 
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        
        {/* Search Bar */}
        <div className="relative hidden sm:block w-full max-w-xs md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search medicines, reminders..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl text-[13px] font-medium placeholder-slate-405 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 dark:focus:ring-blue-900 transition-all text-slate-705 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="w-10 h-10 bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 relative hover:text-blue-600 transition-colors shrink-0">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
            3
          </span>
        </button>
        
        {/* User Profile Summary */}
        {user ? (
          <>
            <div className="flex items-center gap-3 pl-3 border-l border-slate-100 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-blue-600 font-bold bg-[#EFF4FF] dark:bg-blue-950 w-full h-full flex items-center justify-center text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate leading-tight">
                  {user.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); logout(); }}
              className="w-10 h-10 ml-1 bg-red-50 dark:bg-red-950/30 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <div className="flex items-center pl-3 border-l border-slate-100 dark:border-slate-800">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
