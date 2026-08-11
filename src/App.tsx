import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Budget } from './pages/Budget';
import { Expenses } from './pages/Expenses';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { ExpenseForm } from './components/ExpenseForm';
import { Wallet } from 'lucide-react';

const AppContent: React.FC = () => {
  const { monthsData, currentMonthId, isLoading } = useBudget();
  
  // State for managing add/edit expense modal globally
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseIdToEdit, setExpenseIdToEdit] = useState<string | undefined>(undefined);

  const handleOpenExpenseModal = (expenseId?: string) => {
    setExpenseIdToEdit(expenseId);
    setExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setExpenseIdToEdit(undefined);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-650 to-indigo-650 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 animate-spin mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-slate-450 uppercase animate-pulse">Initializing System...</p>
      </div>
    );
  }

  // If no months exist, show Onboarding to set up the first period
  const hasPeriods = Object.keys(monthsData).length > 0;
  if (!hasPeriods || !currentMonthId) {
    return <Onboarding />;
  }

  return (
    <Router>
      <AppLayout onOpenExpenseModal={() => handleOpenExpenseModal()}>
        <Routes>
          <Route path="/" element={<Dashboard onOpenExpenseModal={handleOpenExpenseModal} />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/expenses" element={<Expenses onOpenExpenseModal={handleOpenExpenseModal} />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Modal for Add/Edit Expense */}
        <ExpenseForm 
          isOpen={expenseModalOpen} 
          onClose={handleCloseExpenseModal} 
          expenseId={expenseIdToEdit} 
        />
      </AppLayout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  );
};

export default App;
