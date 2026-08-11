import React, { useState } from 'react';
import { Wallet, ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

export const Onboarding: React.FC = () => {
  const { createMonth, updateSettings } = useBudget();
  const [totalBudget, setTotalBudget] = useState('50000');
  const [currency, setCurrency] = useState('INR');
  
  // Format Month ID to current date by default (YYYY-MM)
  const today = new Date();
  const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [monthId, setMonthId] = useState(currentMonthString);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const budgetVal = parseFloat(totalBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      setError('Total budget must be a positive number');
      return;
    }

    if (!monthId) {
      setError('Please select a valid month');
      return;
    }

    // Save currency to settings
    updateSettings({ currency });
    
    // Create the month
    createMonth(monthId, budgetVal);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-4 text-slate-100 font-sans relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-violet-650/15 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-blue-650/15 blur-[120px]" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Info Section */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Empower Your Finances
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-gradient-primary">
            Take Control of <br className="hidden sm:inline" /> Your Money Today.
          </h1>
          
          <p className="text-slate-400 text-base max-w-md mx-auto lg:mx-0 leading-relaxed">
            Set your monthly budget, organize your categories, and automatically track where your money goes. Simple, beautiful, and completely offline.
          </p>

          <div className="hidden lg:grid grid-cols-2 gap-4 pt-4 max-w-md">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-450 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Smart Analytics</h4>
                <p className="text-xs text-slate-500 mt-0.5">Real-time alerts and simple breakdowns.</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-455 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">100% Private</h4>
                <p className="text-xs text-slate-500 mt-0.5">Data is stored locally on your device.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-650 flex items-center justify-center text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Create First Budget</h2>
              <p className="text-xs text-slate-400">Initialize your tracker parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date Selection */}
            <div>
              <label htmlFor="onboarding-month" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Period
              </label>
              <input
                id="onboarding-month"
                type="month"
                value={monthId}
                onChange={(e) => setMonthId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                required
              />
            </div>

            {/* Total Budget */}
            <div>
              <label htmlFor="onboarding-budget" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Total Monthly Budget
              </label>
              <div className="relative">
                <input
                  id="onboarding-budget"
                  type="number"
                  placeholder="e.g. 50000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
                  required
                />
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <label htmlFor="onboarding-currency" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Base Currency
              </label>
              <select
                id="onboarding-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-200"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-violet-650 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-650/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
