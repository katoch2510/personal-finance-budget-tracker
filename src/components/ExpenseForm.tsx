import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, FileText } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { getCurrencySymbol } from '../utils/formatters';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  expenseId?: string; // If passed, form runs in EDIT mode
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, expenseId }) => {
  const { 
    currentMonthId, 
    currentMonthData, 
    addExpense, 
    updateExpense,
    settings 
  } = useBudget();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get date boundary min/max for the current month
  const dateBounds = React.useMemo(() => {
    if (!currentMonthId) return { min: '', max: '', defaultDate: '' };
    const [year, month] = currentMonthId.split('-');
    const y = parseInt(year);
    const m = parseInt(month);
    const min = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const max = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    // Default date is today's date if today is in the active month, otherwise the first of the month
    const today = new Date();
    const isTodayInActive = today.getFullYear() === y && (today.getMonth() + 1) === m;
    const defaultDate = isTodayInActive 
      ? today.toISOString().split('T')[0]
      : min;

    return { min, max, defaultDate };
  }, [currentMonthId]);

  // Load expense details if in edit mode
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (expenseId && currentMonthData) {
        const expense = currentMonthData.expenses.find(exp => exp.id === expenseId);
        if (expense) {
          setName(expense.name);
          setAmount(expense.amount.toString());
          setCategoryId(expense.categoryId);
          setDate(expense.date);
          setNote(expense.note || '');
          return;
        }
      }
      
      // Default reset for adding
      setName('');
      setAmount('');
      setCategoryId(currentMonthData?.categories[0]?.id || '');
      setDate(dateBounds.defaultDate);
      setNote('');
    }
  }, [isOpen, expenseId, currentMonthData, dateBounds]);

  if (!isOpen || !currentMonthData) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Expense name is required';
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const [year, month] = date.split('-');
      const expectedMonthId = `${year}-${month}`;
      if (expectedMonthId !== currentMonthId) {
        newErrors.date = `Date must be within the active period (${currentMonthId})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAmount = parseFloat(amount);

    if (expenseId) {
      updateExpense(currentMonthId, expenseId, {
        name: name.trim(),
        amount: parsedAmount,
        categoryId,
        date,
        note: note.trim() || undefined
      });
    } else {
      addExpense(
        currentMonthId,
        name.trim(),
        parsedAmount,
        categoryId,
        date,
        note.trim() || undefined
      );
    }
    onClose();
  };

  const currencySymbol = getCurrencySymbol(settings.currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-150">
            {expenseId ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentMonthData.categories.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              You need to create at least one spending category before adding expenses.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Okay, Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Expense Name */}
            <div>
              <label htmlFor="expense-name" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Expense Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <input
                  id="expense-name"
                  type="text"
                  placeholder="e.g. Grocery shopping, Uber ride"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-all`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Amount ({settings.currency})
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <span className="text-sm font-semibold">{currencySymbol}</span>
                </div>
                <input
                  id="expense-amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                    errors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-all`}
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount}</p>}
            </div>

            {/* Category Select */}
            <div>
              <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Tag className="w-4.5 h-4.5" />
                </div>
                <select
                  id="expense-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-all"
                >
                  {currentMonthData.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.categoryId}</p>}
            </div>

            {/* Date Picker */}
            <div>
              <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <input
                  id="expense-date"
                  type="date"
                  min={dateBounds.min}
                  max={dateBounds.max}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border ${
                    errors.date ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-all`}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-medium"> Must be between {dateBounds.min} and {dateBounds.max}</p>
              {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date}</p>}
            </div>

            {/* Note */}
            <div>
              <label htmlFor="expense-note" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Note (Optional)
              </label>
              <textarea
                id="expense-note"
                rows={2}
                placeholder="Add details, receipt notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-all resize-none"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-750 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {expenseId ? 'Update Expense' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
