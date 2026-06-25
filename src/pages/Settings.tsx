import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { PageHeader } from '../components/dashboard/PageHeader';
import { Bell, Clock, Sun, Moon, Globe, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  // Notification States
  const [dailyReminders, setDailyReminders] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  // Time States
  const [morningTime, setMorningTime] = useState('08:30');
  const [afternoonTime, setAfternoonTime] = useState('14:00');
  const [nightTime, setNightTime] = useState('20:00');

  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Language State
  const [language, setLanguage] = useState<'en' | 'hi'>(() => 
    (localStorage.getItem('language') as 'en' | 'hi') || 'en'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('healthsync_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDailyReminders(parsed.dailyReminders ?? true);
        setLowStockAlerts(parsed.lowStockAlerts ?? true);
        setWeeklyReports(parsed.weeklyReports ?? false);
        setMorningTime(parsed.morningTime ?? '08:30');
        setAfternoonTime(parsed.afternoonTime ?? '14:00');
        setNightTime(parsed.nightTime ?? '20:00');
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }, []);

  // Theme effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSave = () => {
    const settings = {
      dailyReminders,
      lowStockAlerts,
      weeklyReports,
      morningTime,
      afternoonTime,
      nightTime
    };
    
    try {
      localStorage.setItem('healthsync_settings', JSON.stringify(settings));
      localStorage.setItem('language', language);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save settings', e);
      alert('Failed to save settings.');
    }
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Settings" 
        subtitle="Manage your notification preferences, schedules, themes, and locale." 
        user={user} 
      />

      <div className="max-w-3xl flex flex-col gap-6">
        
        {/* Success Alert */}
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-250 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-4 rounded-2xl flex items-center gap-2.5 animate-fade-in">
            <CheckCircle size={18} />
            <span className="text-xs font-bold">Settings saved successfully!</span>
          </div>
        )}

        {/* 1. Notification Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-850">
            <Bell size={18} className="text-blue-600" />
            Notification Preferences
          </h3>

          <div className="space-y-4">
            {/* Switch 1 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-850 dark:text-white">Daily Intake Reminders</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Receive reminders for scheduled morning, afternoon, and night medicines.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={dailyReminders} 
                  onChange={(e) => setDailyReminders(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Switch 2 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-850 dark:text-white">Low Stock Alerts</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Alert me when a medicine falls below 10 tablets/units.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={lowStockAlerts} 
                  onChange={(e) => setLowStockAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Switch 3 */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-slate-855 dark:text-white">Weekly Summary Email</h4>
                <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">Receive a weekly digest report of completion status and streaks.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={weeklyReports} 
                  onChange={(e) => setWeeklyReports(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 2. Global Reminder Schedule Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-850">
            <Clock size={18} className="text-blue-600" />
            Global Reminder Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Morning Slot Time</label>
              <input
                type="time"
                value={morningTime}
                onChange={(e) => setMorningTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Afternoon Slot Time</label>
              <input
                type="time"
                value={afternoonTime}
                onChange={(e) => setAfternoonTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Night Slot Time</label>
              <input
                type="time"
                value={nightTime}
                onChange={(e) => setNightTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-805 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Theme Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-850">
            {theme === 'dark' ? <Moon size={18} className="text-blue-600" /> : <Sun size={18} className="text-blue-600" />}
            Theme Settings
          </h3>

          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-3 border rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                theme === 'light'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Sun size={16} /> Light Mode
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-3 border rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Moon size={16} /> Dark Mode
            </button>
          </div>
        </div>

        {/* 4. Language Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-850">
            <Globe size={18} className="text-blue-600" />
            Locale & Language Settings
          </h3>

          <div className="space-y-1.5 max-w-sm">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select App Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>

        {/* Save Controls */}
        <button
          onClick={handleSave}
          className="w-full sm:w-auto self-end px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Save size={16} /> Save Changes
        </button>

      </div>
    </DashboardLayout>
  );
}
