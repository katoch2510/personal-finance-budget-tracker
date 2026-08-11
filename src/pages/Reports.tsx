import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Calculator, 
  ShoppingBag,
  Award
} from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export const Reports: React.FC = () => {
  const { currentMonthData, getCategoryStats, overallStats, settings } = useBudget();

  if (!currentMonthData) return null;

  // Calculate advanced metrics
  const reportsMetrics = useMemo(() => {
    const expenses = currentMonthData.expenses;
    const categories = currentMonthData.categories;

    if (expenses.length === 0) {
      return {
        avgExpense: 0,
        highestExpense: null,
        highestCategory: null as { name: string; icon: string; spent: number } | null,
        totalTransactions: 0,
      };
    }

    const totalTransactions = expenses.length;
    const avgExpense = overallStats.totalSpent / totalTransactions;

    // Highest Expense
    const highestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];

    // Highest Spending Category
    let highestCat: { name: string; icon: string; spent: number } | null = null;
    let maxSpent = -1;

    categories.forEach(cat => {
      const stats = getCategoryStats(cat.id);
      if (stats.spent > maxSpent) {
        maxSpent = stats.spent;
        highestCat = {
          name: cat.name,
          icon: cat.icon,
          spent: stats.spent,
        };
      }
    });

    return {
      avgExpense,
      highestExpense,
      highestCategory: maxSpent > 0 ? highestCat : null,
      totalTransactions,
    };
  }, [currentMonthData, overallStats.totalSpent, getCategoryStats]);

  // Chart Data for Budget vs Actual Bar Chart
  const barChartData = useMemo(() => {
    return currentMonthData.categories.map(cat => {
      const stats = getCategoryStats(cat.id);
      return {
        name: cat.name,
        Budget: cat.budget,
        Spent: stats.spent,
      };
    });
  }, [currentMonthData.categories, getCategoryStats]);

  const hasData = currentMonthData.expenses.length > 0 || currentMonthData.categories.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Reports</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Deep-dive analysis of your monthly spending habits</p>
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-[#111827] text-center p-16 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">No Analytics Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You must add categories and log transactions to populate metrics and charts.
          </p>
        </div>
      ) : (
        <>
          {/* METRIC CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Total Spending */}
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Spending</span>
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(overallStats.totalSpent, settings.currency)}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Spent out of {formatCurrency(overallStats.totalBudget, settings.currency)} budget
                </p>
              </div>
            </div>

            {/* Average Transaction */}
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Average Expense</span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                  <Calculator className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(reportsMetrics.avgExpense, settings.currency)}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Calculated from {reportsMetrics.totalTransactions} transactions
                </p>
              </div>
            </div>

            {/* Highest Spending Category */}
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Top Spending Category</span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-450">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                {reportsMetrics.highestCategory ? (
                  <>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                      {reportsMetrics.highestCategory.icon} {reportsMetrics.highestCategory.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Total spent: <strong className="text-slate-650 dark:text-slate-350">{formatCurrency(reportsMetrics.highestCategory.spent, settings.currency)}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-400 italic">None yet</h3>
                    <p className="text-[10px] text-slate-400 mt-1">No spending logged</p>
                  </>
                )}
              </div>
            </div>

            {/* Highest Individual Expense */}
            <div className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Highest Single Transaction</span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                {reportsMetrics.highestExpense ? (
                  <>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                      {reportsMetrics.highestExpense.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Amount: <strong className="text-slate-650 dark:text-slate-350">{formatCurrency(reportsMetrics.highestExpense.amount, settings.currency)}</strong> on {reportsMetrics.highestExpense.date}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-400 italic">None yet</h3>
                    <p className="text-[10px] text-slate-400 mt-1">No transactions logged</p>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* BUDGET VS ACTUAL COMPARE CHART */}
          {currentMonthData.categories.length > 0 && (
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-805">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-150">Budget vs. Actual Spending</h3>
                <p className="text-xs text-slate-400">Comparing set limits against actual category expenditures</p>
              </div>

              <div className="w-full h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.theme === 'dark' ? '#1f2937' : '#f1f5f9'} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: settings.theme === 'dark' ? '#9ca3af' : '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: settings.theme === 'dark' ? '#374151' : '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fill: settings.theme === 'dark' ? '#9ca3af' : '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: settings.theme === 'dark' ? '#374151' : '#e2e8f0' }}
                      tickFormatter={(v) => typeof v === 'number' ? `${formatCurrency(v, settings.currency).replace(/₹|\$|€|£|¥/g, '')}` : v}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value), settings.currency), '']}
                      contentStyle={{ 
                        backgroundColor: settings.theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: settings.theme === 'dark' ? '#374151' : '#e5e7eb',
                        borderRadius: '8px',
                        color: settings.theme === 'dark' ? '#f3f4f6' : '#1f2937'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                    />
                    <Bar dataKey="Budget" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
