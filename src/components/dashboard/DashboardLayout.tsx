import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar - Collapsible drawer on mobile/tablet, fixed on desktop */}
      <Sidebar 
        user={user} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Background Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[260px] transition-all duration-300">
        <Topbar 
          user={user} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
        
        {/* Main Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
