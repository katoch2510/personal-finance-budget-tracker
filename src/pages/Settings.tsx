import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  Sun, 
  Moon, 
  CircleDollarSign, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const Settings: React.FC = () => {
  const { settings, updateSettings, exportData, importData, resetAllData } = useBudget();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importJsonPayload, setImportJsonPayload] = useState<string | null>(null);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ currency: e.target.value });
    triggerSuccess('Currency changed successfully!');
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
    triggerSuccess(`Switched to ${theme} mode!`);
  };

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const today = new Date().toISOString().split('T')[0];
      const exportFileDefaultName = `fintrack_backup_${today}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      triggerSuccess('Data exported successfully!');
    } catch (e) {
      setErrorMsg('Failed to export data: ' + (e as Error).message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setImportJsonPayload(result);
        setShowImportConfirmModal(true);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error reading the selected file.');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importJsonPayload) {
      const res = importData(importJsonPayload);
      if (res.success) {
        triggerSuccess('Data imported successfully! The page will reflect changes.');
        setImportJsonPayload(null);
        setShowImportConfirmModal(false);
        // Clear file input value
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setErrorMsg(res.error || 'Invalid backup file structure.');
        setShowImportConfirmModal(false);
      }
    }
  };

  const handleReset = () => {
    resetAllData();
    setShowResetModal(false);
    triggerSuccess('Application reset complete. All data deleted.');
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize application options and data backups</p>
      </div>

      {/* FEEDBACK BANNERS */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center gap-3 text-sm text-emerald-800 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center gap-3 text-sm text-red-800 dark:text-red-400">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-6">
        
        {/* THEME & CURRENCY BOX */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-base text-slate-850 dark:text-slate-150 border-b border-slate-100 dark:border-slate-850 pb-3">
            Preferences
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency Choice */}
            <div className="space-y-2">
              <label htmlFor="settings-currency" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Display Currency
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CircleDollarSign className="w-4.5 h-4.5" />
                </div>
                <select
                  id="settings-currency"
                  value={settings.currency}
                  onChange={handleCurrencyChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">All amounts will format in standard locales</p>
            </div>

            {/* Theme Choice */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Application Theme
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    settings.theme === 'light'
                      ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 text-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                  Light Theme
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <Moon className="w-4.5 h-4.5 text-indigo-500" />
                  Dark Theme
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BACKUP & RESTORE BOX */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-base text-slate-850 dark:text-slate-150 border-b border-slate-100 dark:border-slate-850 pb-3">
            Backup & Sync
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Export */}
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f172a]/20 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Export Data Backup
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export all your budget configuration, categories, and monthly transaction logs to a `.json` backup file. You can restore this data at any time.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Export JSON Backup
              </button>
            </div>

            {/* Import */}
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f172a]/20 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
                  Restore Data Backup
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Import a previously exported `.json` backup file. <strong>Warning:</strong> This will replace all current monthly budgets and expenses stored on this device.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Select Backup File
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM ACTIONS / RESET BOX */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-250 dark:border-slate-800/80 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-base text-red-700 border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-650" />
            Danger Zone
          </h3>

          <div className="p-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/30 dark:bg-red-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-slate-850 dark:text-slate-200">Reset Application</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                This deletes all configuration data, monthly limits, and transactions from local storage. This action is final and cannot be recovered without a backup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 py-2.5 px-5 bg-red-650 hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-red-600/10 transition-all flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              Reset & Delete All
            </button>
          </div>
        </div>

      </div>

      {/* CONFIRM RESET MODAL */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Application & Delete All Data?"
        message="Are you sure you want to completely reset FinTrack? This will delete all monthly plans, expense transaction logs, and category setups from this browser storage. This cannot be undone."
        confirmLabel="Yes, Reset Everything"
        cancelLabel="No, Keep Data"
        type="danger"
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* CONFIRM IMPORT MODAL */}
      <ConfirmationModal
        isOpen={showImportConfirmModal}
        title="Import Data Backup?"
        message="Are you sure you want to load this backup? It will overwrite and replace all categories, months, and transactions currently recorded in your browser. Any unsaved recent work will be lost."
        confirmLabel="Yes, Overwrite & Restore"
        cancelLabel="No, Cancel"
        type="warning"
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirmModal(false);
          setImportJsonPayload(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

    </div>
  );
};
