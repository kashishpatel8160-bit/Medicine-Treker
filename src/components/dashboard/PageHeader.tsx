import { Search, Bell } from 'lucide-react';
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  user?: any;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="px-8 py-8 flex justify-between items-start">
      <div>
        <h1 className="text-[26px] font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-[14px] font-medium mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {actions}
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search medicines, symptoms..." 
            className="pl-11 pr-4 py-3 bg-white border border-slate-100 shadow-sm rounded-2xl w-[340px] text-[14px] font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-700"
          />
        </div>
        <button className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-600 relative hover:text-blue-600 transition-colors shrink-0">
          <Bell size={20} />
          {/* Notification Badge Example */}
          <span className="absolute top-2.5 right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            3
          </span>
        </button>
      </div>
    </header>
  );
}
