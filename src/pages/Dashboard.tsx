import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Wallet, 
  Percent, 
  Layers, 
  Plus, 
  ArrowUpRight, 
  Calendar,
  Bell
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ProgressBar } from '../components/ProgressBar';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const COLOR_MAP: Record<string, { bg: string, text: string, border: string, hex: string }> = {
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', hex: '#6366f1' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-200', hex: '#10b981' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', hex: '#3b82f6' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', hex: '#f59e0b' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200', hex: '#f43f5e' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-650', border: 'border-violet-200', hex: '#8b5cf6' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', hex: '#06b6d4' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-600', border: 'border-slate-200', hex: '#64748b' },
};

interface DashboardProps {
  onOpenExpenseModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenExpenseModal }) => {
  const { currentMonthData, overallStats, getCategoryStats, settings } = useBudget();

  if (!currentMonthData) return null;

  // Generate warnings/notifications
  const alerts: string[] = [];
  if (overallStats.usedPercentage >= 90) {
    alerts.push(`You have used ${overallStats.usedPercentage.toFixed(0)}% of your monthly budget.`);
  }
  if (overallStats.isOverAllocated) {
    alerts.push(`Category budgets exceed your monthly budget by ${formatCurrency(overallStats.overAllocationAmount, settings.currency)}.`);
  }

  currentMonthData.categories.forEach(cat => {
    const stats = getCategoryStats(cat.id);
    if (stats.usedPercentage > 100) {
      alerts.push(`${cat.icon} ${cat.name} is over budget by ${formatCurrency(stats.spent - cat.budget, settings.currency)}.`);
    } else if (stats.usedPercentage === 100) {
      alerts.push(`${cat.icon} ${cat.name} budget has been fully used.`);
    } else if (stats.usedPercentage >= 80) {
      alerts.push(`${cat.icon} ${cat.name} budget is almost used (${stats.usedPercentage.toFixed(0)}%).`);
    }
  });

  // Recharts Chart Data
  const chartData = currentMonthData.categories
    .map(cat => {
      const stats = getCategoryStats(cat.id);
      const colorInfo = COLOR_MAP[cat.color] || COLOR_MAP.slate;
      return {
        name: cat.name,
        value: stats.spent,
        color: colorInfo.hex
      };
    })
    .filter(item => item.value > 0); // only show category if spending > 0

  const hasSpending = chartData.length > 0;

  // Sort expenses by date descending to get recent
  const recentExpenses = [...currentMonthData.expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Format currency symbol
  const totalBudgetFmt = formatCurrency(overallStats.totalBudget, settings.currency);
  const totalSpentFmt = formatCurrency(overallStats.totalSpent, settings.currency);
  const totalRemainingFmt = formatCurrency(overallStats.totalRemaining, settings.currency);
  
  // Remaining status color styling
  const isOverspent = overallStats.totalRemaining < 0;
  const remainingColorClass = isOverspent 
    ? 'text-red-600 dark:text-red-400' 
    : overallStats.usedPercentage > 85 
      ? 'text-amber-600 dark:text-amber-450' 
      : 'text-emerald-600 dark:text-emerald-450';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Overview</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Summary of your financial status this month</p>
        </div>
        
        <button
          onClick={onOpenExpenseModal}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* ALERT/WARNING SYSTEM */}
      {alerts.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-500 dark:text-amber-450 mt-0.5 flex-shrink-0 animate-bounce" />
            <div className="space-y-1.5 flex-1">
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Budget Alerts ({alerts.length})</h4>
              <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-400/90 space-y-1">
                {alerts.map((alert, idx) => (
                  <li key={idx} className="leading-relaxed">{alert}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* OVERALL STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 dark:text-slate-800 pointer-events-none group-hover:scale-110 transition-transform">
            <Wallet className="w-16 h-16 opacity-10" />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-450">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Budget</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalBudgetFmt}</h3>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Limit for active month</span>
            </p>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 dark:text-slate-800 pointer-events-none group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 opacity-10" />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-450">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Spent</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalSpentFmt}</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Spent across all categories
            </p>
          </div>
        </div>

        {/* Remaining Budget Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 dark:text-slate-800 pointer-events-none group-hover:scale-110 transition-transform">
            <Wallet className="w-16 h-16 opacity-10" />
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isOverspent ? 'bg-red-100 dark:bg-red-950/50 text-red-650' : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-450'}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Remaining</span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${remainingColorClass}`}>{totalRemainingFmt}</h3>
            <p className="text-[10px] text-slate-400 mt-1">
              {isOverspent ? 'Exceeded monthly budget!' : 'Available to spend'}
            </p>
          </div>
        </div>

        {/* Used Percentage Card */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 text-slate-100 dark:text-slate-800 pointer-events-none group-hover:scale-110 transition-transform">
            <Percent className="w-16 h-16 opacity-10" />
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-450">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget Used</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {overallStats.usedPercentage.toFixed(0)}%
            </h3>
            <div className="mt-2.5">
              <ProgressBar percentage={overallStats.usedPercentage} height="h-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD CHARTS & RECENT EXPENSES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pie Chart / Spend breakdown */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-5 flex flex-col min-h-[380px]">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-150">Spending Breakdown</h3>
            <p className="text-[11px] text-slate-400">Distribution of expenditures by category</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
            {hasSpending ? (
              <>
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(Number(value), settings.currency), 'Spent']}
                        contentStyle={{ 
                          backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff',
                          borderColor: settings.theme === 'dark' ? '#374151' : '#e5e7eb',
                          borderRadius: '8px',
                          color: settings.theme === 'dark' ? '#f3f4f6' : '#1f2937'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom Legend */}
                <div className="w-full grid grid-cols-2 gap-2 mt-2 max-h-24 overflow-y-auto no-scrollbar px-2">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate text-slate-600 dark:text-slate-350">{item.name}</span>
                      <span className="ml-auto font-semibold text-slate-800 dark:text-slate-200">
                        {((item.value / overallStats.totalSpent) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Spending Registered</h4>
                <p className="text-xs text-slate-400 max-w-[200px] mx-auto">Add an expense to populate this breakdown</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses List */}
        <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-7 flex flex-col min-h-[380px]">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-150">Recent Expenses</h3>
              <p className="text-[11px] text-slate-400">Your latest transactions</p>
            </div>
            
            <Link 
              to="/expenses" 
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
            >
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-start mt-4">
            {recentExpenses.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {recentExpenses.map((exp) => {
                  const cat = currentMonthData.categories.find(c => c.id === exp.categoryId);
                  const colorInfo = cat ? (COLOR_MAP[cat.color] || COLOR_MAP.slate) : COLOR_MAP.slate;
                  return (
                    <div key={exp.id} className="py-3.5 flex items-center justify-between group first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${colorInfo.bg}/10 border ${colorInfo.border}/20 text-slate-800 dark:text-slate-200`}>
                          {cat?.icon || '📦'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {exp.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span className="truncate">{cat?.name || 'Uncategorized'}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span>{formatDate(exp.date, 'short')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 pl-4">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          -{formatCurrency(exp.amount, settings.currency)}
                        </span>
                        {exp.note && (
                          <p className="text-[10px] text-slate-400 max-w-[140px] truncate">{exp.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3 flex-1 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                  <Calendar className="w-5.5 h-5.5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Expenses Recorded</h4>
                <p className="text-xs text-slate-400 max-w-xs">It looks like you haven't tracked any expenses this month.</p>
                <button
                  onClick={onOpenExpenseModal}
                  className="mt-2 flex items-center gap-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all"
                >
                  Track First Expense
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* CATEGORIES PROGRESS OVERVIEW */}
      <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-150">Category Spending</h3>
            <p className="text-[11px] text-slate-400">Active progress cards for all categories</p>
          </div>
          
          <Link 
            to="/categories" 
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            Manage Categories
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {currentMonthData.categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentMonthData.categories.map((cat) => {
              const stats = getCategoryStats(cat.id);
              const formattedSpent = formatCurrency(stats.spent, settings.currency);
              const formattedBudget = formatCurrency(cat.budget, settings.currency);
              const formattedRemaining = formatCurrency(Math.abs(stats.remaining), settings.currency);
              const isOver = stats.remaining < 0;

              return (
                <div key={cat.id} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0f172a]/20 flex flex-col justify-between hover:shadow-md dark:hover:bg-[#0f172a]/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80`}>
                        {cat.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Limit: {formattedBudget}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">
                        {isOver ? 'Overspent' : 'Remaining'}
                      </span>
                      <span className={`text-sm font-bold ${isOver ? 'text-red-650' : 'text-slate-700 dark:text-slate-300'}`}>
                        {isOver ? '-' : ''}{formattedRemaining}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Spent: <strong className="text-slate-650 dark:text-slate-350">{formattedSpent}</strong></span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.usedPercentage.toFixed(0)}%</span>
                    </div>
                    <ProgressBar percentage={stats.usedPercentage} height="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-5.5 h-5.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400">No Categories Created</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please create at least one category to allocate your budget and begin tracking expenses.
            </p>
            <Link
              to="/categories"
              className="mt-2 inline-flex items-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-755 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Set Up Categories
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};
