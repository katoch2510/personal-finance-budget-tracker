import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Calendar, 
  X,
  FileText,
  Tag
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { COLOR_MAP } from './Dashboard';

interface ExpensesProps {
  onOpenExpenseModal: (id?: string) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({ onOpenExpenseModal }) => {
  const { currentMonthId, currentMonthData, deleteExpense, settings } = useBudget();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Deletion state
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  if (!currentMonthData) return null;

  // Filtered and Sorted Expenses
  const processedExpenses = useMemo(() => {
    let result = [...currentMonthData.expenses];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(exp => 
        exp.name.toLowerCase().includes(q) || 
        (exp.note && exp.note.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCat) {
      result = result.filter(exp => exp.categoryId === selectedCat);
    }

    // Date range filter
    if (startDate) {
      result = result.filter(exp => exp.date >= startDate);
    }
    if (endDate) {
      result = result.filter(exp => exp.date <= endDate);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return a.date.localeCompare(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return b.date.localeCompare(a.date);
      }
    });

    return result;
  }, [currentMonthData.expenses, search, selectedCat, startDate, endDate, sortBy]);

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpense(currentMonthId || '', expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCat('');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const selectedExpenseDetails = expenseToDelete 
    ? currentMonthData.expenses.find(e => e.id === expenseToDelete) 
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Transaction History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Search, sort, and manage all your tracked expenses</p>
        </div>
        
        <button
          onClick={() => onOpenExpenseModal()}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          Add Expense
        </button>
      </div>

      {/* FILTER & SEARCH CONTROL BOX */}
      <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Tag className="w-4 h-4" />
            </div>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              {currentMonthData.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Sorting options */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

        </div>

        {/* Clear filter and end date row */}
        <div className="flex flex-wrap gap-4 items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          {(search || selectedCat || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-755 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* TRANSACTION LIST/TABLE SECTION */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {processedExpenses.length === 0 ? (
          <div className="text-center p-16 space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-700 dark:text-slate-350">No Transactions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any expenses matching your criteria. Try adjusting your filter parameters or search term.
            </p>
            {(search || selectedCat || startDate || endDate) && (
              <button
                onClick={clearFilters}
                className="mt-2 py-2 px-4 bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-850 bg-slate-50/50 dark:bg-[#0f172a]/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Expense Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Transaction Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {processedExpenses.map((exp) => {
                    const cat = currentMonthData.categories.find(c => c.id === exp.categoryId);
                    const colorInfo = cat ? (COLOR_MAP[cat.color] || COLOR_MAP.slate) : COLOR_MAP.slate;

                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {exp.name}
                          </div>
                          {exp.note && (
                            <div className="text-xs text-slate-450 mt-1 max-w-sm truncate" title={exp.note}>
                              {exp.note}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0f172a]/5 dark:bg-white/5 border ${colorInfo.border}/20`}>
                            <span>{cat?.icon || '📦'}</span>
                            <span className="text-slate-600 dark:text-slate-350">{cat?.name || 'Uncategorized'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(exp.date, 'full')}
                        </td>
                        <td className="px-6 py-4.5 text-right font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {formatCurrency(exp.amount, settings.currency)}
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onOpenExpenseModal(exp.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => setExpenseToDelete(exp.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST VIEW */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-850 px-4">
              {processedExpenses.map((exp) => {
                const cat = currentMonthData.categories.find(c => c.id === exp.categoryId);

                return (
                  <div key={exp.id} className="py-4 space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 pr-4 min-w-0">
                        <h4 className="font-semibold text-slate-850 dark:text-slate-150 text-sm truncate">{exp.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <span>{cat?.icon} {cat?.name}</span>
                          <span>•</span>
                          <span>{formatDate(exp.date, 'short')}</span>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {formatCurrency(exp.amount, settings.currency)}
                        </span>
                      </div>
                    </div>

                    {exp.note && (
                      <p className="text-xs text-slate-450 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg italic">
                        {exp.note}
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-1">
                      <button
                        onClick={() => onOpenExpenseModal(exp.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-650 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(exp.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-550 hover:text-red-650 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CONFIRM DELETE EXPENSE MODAL */}
      <ConfirmationModal
        isOpen={expenseToDelete !== null}
        title="Delete Expense Transaction?"
        message={`Are you sure you want to delete the transaction "${selectedExpenseDetails?.name}" for ${selectedExpenseDetails ? formatCurrency(selectedExpenseDetails.amount, settings.currency) : ''}? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        type="danger"
        onConfirm={confirmDeleteExpense}
        onCancel={() => setExpenseToDelete(null)}
      />

    </div>
  );
};
