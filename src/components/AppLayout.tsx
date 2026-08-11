import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Layers,
  BarChart3, 
  Settings as SettingsIcon,
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { getMonthName } from '../utils/formatters';

interface AppLayoutProps {
  children: React.ReactNode;
  onOpenExpenseModal: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, onOpenExpenseModal }) => {
  const location = useLocation();
  const { 
    currentMonthId, 
    setCurrentMonthId, 
    monthsData, 
    settings, 
    updateSettings 
  } = useBudget();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Budget', path: '/budget', icon: Wallet },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  // Helper to extract month keys and sort them chronologically
  const availableMonths = Object.keys(monthsData).sort((a, b) => a.localeCompare(b));

  const handlePrevMonth = () => {
    if (!currentMonthId) return;
    const currentIndex = availableMonths.indexOf(currentMonthId);
    if (currentIndex > 0) {
      setCurrentMonthId(availableMonths[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (!currentMonthId) return;
    const currentIndex = availableMonths.indexOf(currentMonthId);
    if (currentIndex < availableMonths.length - 1) {
      setCurrentMonthId(availableMonths[currentIndex + 1]);
    }
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const formatMonthId = (id: string) => {
    if (!id) return '';
    const [year, month] = id.split('-');
    return `${getMonthName(parseInt(month))} ${year}`;
  };

  const hasPrevMonth = currentMonthId ? availableMonths.indexOf(currentMonthId) > 0 : false;
  const hasNextMonth = currentMonthId ? availableMonths.indexOf(currentMonthId) < availableMonths.length - 1 : false;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-slate-800 fixed h-full z-30">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-gradient-primary">FinTrack</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Budget Engine</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <button
            onClick={onOpenExpenseModal}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-all"
          >
            <span className="flex items-center gap-2">
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              {settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px]">Theme</kbd>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <h1 className="font-bold text-base text-gradient-primary">FinTrack</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-505 dark:text-slate-400"
            aria-label="Toggle Theme"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onOpenExpenseModal}
            className="p-2 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20"
            aria-label="Add Expense"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* TOP NAVBAR (MONTH SELECTOR) */}
        {currentMonthId && (
          <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-center md:justify-between sticky top-0 md:top-0 z-20 shadow-sm md:shadow-none">
            <div className="hidden md:block">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Period</h2>
            </div>
            
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200/50 dark:border-slate-800">
              <button
                onClick={handlePrevMonth}
                disabled={!hasPrevMonth}
                className={`p-2 rounded-lg transition-all ${
                  hasPrevMonth 
                    ? 'text-slate-700 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm' 
                    : 'text-slate-350 dark:text-slate-600 cursor-not-allowed'
                }`}
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-5 font-semibold text-sm text-slate-700 dark:text-slate-200 min-w-[140px] text-center select-none font-sans">
                {formatMonthId(currentMonthId)}
              </span>
              
              <button
                onClick={handleNextMonth}
                disabled={!hasNextMonth}
                className={`p-2 rounded-lg transition-all ${
                  hasNextMonth 
                    ? 'text-slate-700 dark:text-slate-350 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm' 
                    : 'text-slate-350 dark:text-slate-600 cursor-not-allowed'
                }`}
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden md:block w-8" /> {/* Spacer to center the selector on desktop */}
          </div>
        )}

        {/* CONTAINER FOR CHILDREN */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 z-30 shadow-lg overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-lg transition-all duration-150 flex-shrink-0 ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
