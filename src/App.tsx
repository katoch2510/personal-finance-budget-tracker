import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Budget } from './pages/Budget';
import { Expenses } from './pages/Expenses';
import { Categories } from './pages/Categories';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { ExpenseForm } from './components/ExpenseForm';
import { Wallet } from 'lucide-react';

const DashboardContainer: React.FC = () => {
  const { monthsData, currentMonthId, isLoading } = useBudget();
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
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 animate-spin mb-4">
          <Wallet className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase animate-pulse">Initializing System...</p>
      </div>
    );
  }

  const hasPeriods = Object.keys(monthsData).length > 0;
  if (!hasPeriods || !currentMonthId) {
    return <Onboarding />;
  }

  return (
    <AppLayout onOpenExpenseModal={() => handleOpenExpenseModal()}>
      <Routes>
        <Route path="/" element={<Dashboard onOpenExpenseModal={handleOpenExpenseModal} />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/expenses" element={<Expenses onOpenExpenseModal={handleOpenExpenseModal} />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ExpenseForm 
        isOpen={expenseModalOpen} 
        onClose={handleCloseExpenseModal} 
        expenseId={expenseIdToEdit} 
      />
    </AppLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BudgetProvider>
        <Router>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardContainer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </BudgetProvider>
    </AuthProvider>
  );
};

export default App;
