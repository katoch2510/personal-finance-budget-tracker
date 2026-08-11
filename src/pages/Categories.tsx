import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Check, 
  X,
  Wallet,
  Coins,
  Calculator
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/formatters';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { COLOR_MAP } from './Dashboard';

const PRESET_EMOJIS = [
  '🍔', '🏠', '🚗', '🛍️', '🎬', '🐷', '📦', '🏥', 
  '🎓', '✈️', '💡', '🔌', '💻', '🏋️', '🎁', '📚', 
  '💇', '☕', '🍷', '⚽', '🎮', '🐾', '🔨', '🧼'
];

const PRESET_COLORS = [
  'indigo', 'emerald', 'blue', 'amber', 'rose', 'violet', 'cyan', 'slate'
];

export const Categories: React.FC = () => {
  const { 
    currentMonthId, 
    currentMonthData, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    getCategoryStats,
    overallStats,
    settings 
  } = useBudget();

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [icon, setIcon] = useState('🍔');
  const [color, setColor] = useState('indigo');
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  if (!currentMonthData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    const budgetVal = parseFloat(budget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setFormError('Budget must be a positive number');
      return;
    }

    if (editCategoryId) {
      updateCategory(currentMonthId, editCategoryId, {
        name: name.trim(),
        budget: budgetVal,
        icon,
        color
      });
    } else {
      addCategory(currentMonthId, name.trim(), icon, budgetVal, color);
    }

    // Reset Form
    resetForm();
  };

  const startEdit = (catId: string) => {
    const cat = currentMonthData.categories.find(c => c.id === catId);
    if (cat) {
      setEditCategoryId(catId);
      setName(cat.name);
      setBudget(cat.budget.toString());
      setIcon(cat.icon);
      setColor(cat.color);
      setShowForm(true);
    }
  };

  const resetForm = () => {
    setEditCategoryId(null);
    setName('');
    setBudget('');
    setIcon('🍔');
    setColor('indigo');
    setShowForm(false);
    setFormError('');
  };

  const confirmDelete = () => {
    if (catToDelete) {
      deleteCategory(currentMonthId, catToDelete);
      setCatToDelete(null);
    }
  };

  const selectedCategoryToDelete = catToDelete 
    ? currentMonthData.categories.find(c => c.id === catToDelete) 
    : null;

  const affectedExpensesCount = selectedCategoryToDelete 
    ? currentMonthData.expenses.filter(e => e.categoryId === catToDelete).length 
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">Budget Categories</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage spending divisions and allocations</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      {/* OVER-ALLOCATION BANNER */}
      {overallStats.isOverAllocated && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Budget Limit Warning</h4>
            <p className="text-xs text-red-700 dark:text-red-400/90 leading-relaxed">
              Category budgets exceed your monthly budget by <strong>{formatCurrency(overallStats.overAllocationAmount, settings.currency)}</strong>. 
              (Monthly Budget: {formatCurrency(overallStats.totalBudget, settings.currency)}, Allocated: {formatCurrency(overallStats.allocatedBudget, settings.currency)}).
            </p>
          </div>
        </div>
      )}

      {/* COMPACT BUDGET OVERVIEW CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Monthly Budget</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(overallStats.totalBudget, settings.currency)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Allocated</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(overallStats.allocatedBudget, settings.currency)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Remaining Unallocated</span>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(overallStats.unallocatedBudget, settings.currency)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ADD/EDIT FORM COLUMN */}
        {showForm && (
          <div className="lg:col-span-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-150">
                {editCategoryId ? 'Edit Category' : 'Create Category'}
              </h3>
              <button 
                onClick={resetForm}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label htmlFor="category-name" className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Category Name
                </label>
                <input
                  id="category-name"
                  type="text"
                  placeholder="e.g. Dining, Shopping"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                  required
                />
              </div>

              {/* Budget Limit */}
              <div>
                <label htmlFor="category-budget" className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Allocated Budget ({settings.currency})
                </label>
                <input
                  id="category-budget"
                  type="number"
                  placeholder="e.g. 10000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
                  required
                />
              </div>

              {/* Emoji Picker Grid */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Icon Emojis
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-h-32 overflow-y-auto no-scrollbar">
                  {PRESET_EMOJIS.map((emojiChar) => (
                    <button
                      key={emojiChar}
                      type="button"
                      onClick={() => setIcon(emojiChar)}
                      className={`h-9 w-full flex items-center justify-center rounded-lg text-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all ${
                        icon === emojiChar ? 'bg-indigo-50 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-850 scale-105' : ''
                      }`}
                    >
                      {emojiChar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker Grid */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Theme Color Card
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_COLORS.map((col) => {
                    const mappedColor = COLOR_MAP[col];
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColor(col)}
                        className={`h-8 w-full rounded-lg flex items-center justify-center border transition-all ${mappedColor.bg} ${
                          color === col 
                            ? 'border-indigo-650 dark:border-white ring-2 ring-indigo-500/20 scale-105' 
                            : 'border-transparent'
                        }`}
                        title={col}
                      >
                        {color === col && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-550 font-medium">
                  {formError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 rounded-xl transition-all"
                >
                  {editCategoryId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST OF CATEGORY CARDS */}
        <div className={`space-y-4 ${showForm ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {currentMonthData.categories.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] text-center p-16 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">No Categories Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Organize your expenses by adding categories. Assign budget bounds to monitor overspending.
              </p>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="mt-2 inline-flex items-center gap-1.5 py-2 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
              >
                Create First Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentMonthData.categories.map((cat) => {
                const stats = getCategoryStats(cat.id);
                const colorInfo = COLOR_MAP[cat.color] || COLOR_MAP.slate;
                const formattedSpent = formatCurrency(stats.spent, settings.currency);
                const formattedBudget = formatCurrency(cat.budget, settings.currency);
                const formattedRemaining = formatCurrency(Math.abs(stats.remaining), settings.currency);
                const isOver = stats.remaining < 0;

                return (
                  <div key={cat.id} className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorInfo.bg}/10 border ${colorInfo.border}/20 text-slate-800 dark:text-slate-100`}>
                          {cat.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-850 dark:text-slate-150">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                            Budget: {formattedBudget}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-650 hover:bg-slate-50 dark:hover:bg-slate-800"
                          title="Edit Category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCatToDelete(cat.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Details */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">
                          Spent: <strong className="text-slate-650 dark:text-slate-350">{formattedSpent}</strong>
                        </span>
                        <span className={`font-bold ${isOver ? 'text-red-650' : 'text-slate-400'}`}>
                          {isOver ? 'Exceeded by ' : 'Remaining: '}{formattedRemaining}
                        </span>
                      </div>
                      
                      <ProgressBar percentage={stats.usedPercentage} height="h-2.5" />
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 font-medium">
                        <span>Used: {stats.usedPercentage.toFixed(1)}%</span>
                        {isOver && <span className="text-red-500 font-semibold pulse-warning">Over Limit!</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* CONFIRM DELETE CATEGORY MODAL */}
      <ConfirmationModal
        isOpen={catToDelete !== null}
        title="Delete Category?"
        message={`Are you sure you want to delete the category "${selectedCategoryToDelete?.name}"? ${
          affectedExpensesCount > 0 
            ? `Warning: This will also delete ${affectedExpensesCount} expense transactions belonging to this category.` 
            : 'No expense transactions will be affected.'
        } This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setCatToDelete(null)}
      />

    </div>
  );
};
