import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  ChevronRight
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const Budget: React.FC = () => {
  const { 
    monthsData, 
    currentMonthId, 
    setCurrentMonthId, 
    createMonth, 
    updateTotalBudget, 
    deleteMonth,
    overallStats,
    settings 
  } = useBudget();

  // State for creating new month
  const [newMonthId, setNewMonthId] = useState('');
  const [newBudget, setNewBudget] = useState('50000');
  const [copyFromMonth, setCopyFromMonth] = useState('');
  const [monthError, setMonthError] = useState('');

  // State for editing current total budget
  const [editBudgetVal, setEditBudgetVal] = useState('');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState('');

  // State for delete month confirmation
  const [monthToDelete, setMonthToDelete] = useState<string | null>(null);

  const handleCreateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    setMonthError('');

    if (!newMonthId) {
      setMonthError('Please select a month');
      return;
    }

    if (monthsData[newMonthId]) {
      setMonthError('This month already exists!');
      return;
    }

    const budgetVal = parseFloat(newBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setMonthError('Budget must be a positive number');
      return;
    }

    createMonth(newMonthId, budgetVal, copyFromMonth || undefined);
    
    // Reset form
    setNewMonthId('');
    setNewBudget('50000');
    setCopyFromMonth('');
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetError('');

    if (!currentMonthId) return;

    const budgetVal = parseFloat(editBudgetVal);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setBudgetError('Budget must be a positive number');
      return;
    }

    updateTotalBudget(currentMonthId, budgetVal);
    setIsEditingBudget(false);
    setEditBudgetVal('');
  };

  const startEditingBudget = () => {
    if (!currentMonthId || !monthsData[currentMonthId]) return;
    setEditBudgetVal(monthsData[currentMonthId].totalBudget.toString());
    setIsEditingBudget(true);
  };

  const confirmDeleteMonth = () => {
    if (monthToDelete) {
      deleteMonth(monthToDelete);
      setMonthToDelete(null);
    }
  };

  const formatMonthId = (id: string) => {
    const [year, month] = id.split('-');
    return `${getMonthName(parseInt(month))} ${year}`;
  };

  const allocatedPercentage = overallStats.totalBudget > 0 
    ? (overallStats.allocatedBudget / overallStats.totalBudget) * 100 
    : 0;

  const unallocatedPercentage = Math.max(0, 100 - allocatedPercentage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Budget Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure your monthly spending limits and periods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVE BUDGET STATS & ALLOCATION */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Period Budget Configuration */}
          {currentMonthId && (
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-150">Active Period Budget</h3>
                  <p className="text-xs text-slate-400">Total limit for {formatMonthId(currentMonthId)}</p>
                </div>
                {!isEditingBudget && (
                  <button
                    onClick={startEditingBudget}
                    className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline"
                  >
                    Edit Budget
                  </button>
                )}
              </div>

              {isEditingBudget ? (
                <form onSubmit={handleUpdateBudget} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={editBudgetVal}
                      onChange={(e) => setEditBudgetVal(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200"
                      placeholder="Enter new budget"
                      required
                    />
                    {budgetError && <p className="text-red-500 text-xs mt-1 font-medium">{budgetError}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition-all"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingBudget(false)}
                      className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-gradient-primary">
                    {formatCurrency(overallStats.totalBudget, settings.currency)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/{settings.currency}</span>
                </div>
              )}

              {/* ALLOCATION MATRIX */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Budget Allocation</span>
                  <span className={`font-bold ${overallStats.isOverAllocated ? 'text-red-650' : 'text-emerald-600 dark:text-emerald-450'}`}>
                    {overallStats.isOverAllocated 
                      ? `Over-allocated by ${formatCurrency(overallStats.overAllocationAmount, settings.currency)}`
                      : `${formatCurrency(overallStats.allocatedBudget, settings.currency)} Allocated`
                    }
                  </span>
                </div>

                {/* Progress bar split */}
                <div className="w-full h-4 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200/20 dark:border-slate-800/50">
                  <div 
                    className={`h-full transition-all duration-500 ${overallStats.isOverAllocated ? 'bg-red-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min(100, allocatedPercentage)}%` }}
                    title={`Allocated: ${allocatedPercentage.toFixed(1)}%`}
                  />
                  {!overallStats.isOverAllocated && (
                    <div 
                      className="h-full bg-emerald-450 transition-all duration-500" 
                      style={{ width: `${unallocatedPercentage}%` }}
                      title={`Unallocated: ${unallocatedPercentage.toFixed(1)}%`}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${overallStats.isOverAllocated ? 'bg-red-500' : 'bg-indigo-500'}`} />
                    <div>
                      <span className="text-slate-400 font-medium">Allocated Categories</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(overallStats.allocatedBudget, settings.currency)} ({allocatedPercentage.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-450" />
                    <div>
                      <span className="text-slate-400 font-medium">Unallocated Savings</span>
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(overallStats.unallocatedBudget, settings.currency)} ({unallocatedPercentage.toFixed(0)}%)
                      </p>
                    </div>
                  </div>
                </div>

                {overallStats.isOverAllocated && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Warning:</strong> Category budgets exceed your monthly budget by <strong>{formatCurrency(overallStats.overAllocationAmount, settings.currency)}</strong>. Reduce individual category limits to stay within bounds.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LIST OF CONFIGURED MONTHS */}
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-150">All Budget Periods</h3>
              <p className="text-xs text-slate-400">List of active monthly trackers</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {Object.keys(monthsData).sort((a, b) => b.localeCompare(a)).map((monthId) => {
                const mData = monthsData[monthId];
                const isActive = monthId === currentMonthId;
                const spent = mData.expenses.reduce((s, e) => s + e.amount, 0);

                return (
                  <div key={monthId} className={`py-4 flex items-center justify-between group first:pt-0 last:pb-0`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        isActive 
                          ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-250 dark:border-slate-700 text-slate-400'
                      }`}>
                        <Calendar className="w-5 h-5" />
                      </div>
                      
                      <div>
                        <h4 
                          onClick={() => setCurrentMonthId(monthId)}
                          className="font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-650 cursor-pointer transition-colors"
                        >
                          {formatMonthId(monthId)}
                          {isActive && <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-950/50 text-indigo-650 px-2 py-0.5 rounded-full font-bold">Active</span>}
                        </h4>
                        
                        <div className="flex gap-2 text-xs text-slate-400 mt-0.5">
                          <span>Budget: <strong>{formatCurrency(mData.totalBudget, settings.currency)}</strong></span>
                          <span>•</span>
                          <span>Spent: <strong>{formatCurrency(spent, settings.currency)}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentMonthId(monthId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Switch to this period"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setMonthToDelete(monthId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Delete Period"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CREATE NEW MONTH FORM */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-150">Create New Period</h3>
              </div>
            </div>

            <form onSubmit={handleCreateMonth} className="space-y-4">
              {/* Select Period */}
              <div>
                <label htmlFor="create-period-month" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Period (Month)
                </label>
                <input
                  id="create-period-month"
                  type="month"
                  value={newMonthId}
                  onChange={(e) => setNewMonthId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                  required
                />
              </div>

              {/* Monthly Budget */}
              <div>
                <label htmlFor="create-period-budget" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Monthly Budget Limit
                </label>
                <div className="relative">
                  <input
                    id="create-period-budget"
                    type="number"
                    placeholder="e.g. 50000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Copy Categories option */}
              {Object.keys(monthsData).length > 0 && (
                <div>
                  <label htmlFor="create-period-copy" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Copy Category Structure
                  </label>
                  <select
                    id="create-period-copy"
                    value={copyFromMonth}
                    onChange={(e) => setCopyFromMonth(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                  >
                    <option value="">Don't copy (Create empty)</option>
                    {Object.keys(monthsData).sort((a, b) => b.localeCompare(a)).map((id) => (
                      <option key={id} value={id}>
                        Copy from {formatMonthId(id)}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Copies names, budgets, icons, and colors. Does NOT copy transactions/expenses.
                  </p>
                </div>
              )}

              {monthError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-500 font-medium">
                  {monthError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Initialize Period
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* CONFIRM DELETE MONTH MODAL */}
      <ConfirmationModal
        isOpen={monthToDelete !== null}
        title="Delete Budget Period?"
        message={`Are you sure you want to delete the budget period for ${monthToDelete ? formatMonthId(monthToDelete) : ''}? This will permanently remove all categories and transactions/expenses belonging to this month. This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        type="danger"
        onConfirm={confirmDeleteMonth}
        onCancel={() => setMonthToDelete(null)}
      />

    </div>
  );
};
