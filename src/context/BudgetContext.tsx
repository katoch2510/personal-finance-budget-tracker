import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Category, Expense, MonthData, UserSettings } from '../types';

interface BudgetContextType {
  monthsData: Record<string, MonthData>;
  currentMonthId: string;
  settings: UserSettings;
  isLoading: boolean;
  
  // Navigation
  setCurrentMonthId: (id: string) => void;
  
  // Month Operations
  createMonth: (monthId: string, totalBudget: number, copyFromMonthId?: string) => void;
  updateTotalBudget: (monthId: string, budget: number) => void;
  deleteMonth: (monthId: string) => void;
  
  // Category Operations
  addCategory: (monthId: string, name: string, icon: string, budget: number, color: string) => void;
  updateCategory: (monthId: string, categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (monthId: string, categoryId: string) => void;
  
  // Expense Operations
  addExpense: (monthId: string, name: string, amount: number, categoryId: string, date: string, note?: string) => void;
  updateExpense: (monthId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (monthId: string, expenseId: string) => void;
  
  // Settings & Sync
  updateSettings: (updates: Partial<UserSettings>) => void;
  exportData: () => string;
  importData: (jsonData: string) => { success: boolean; error?: string };
  resetAllData: () => void;
  
  // Computed values for current active month
  currentMonthData: MonthData | undefined;
  overallStats: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    usedPercentage: number;
    allocatedBudget: number;
    unallocatedBudget: number;
    isOverAllocated: boolean;
    overAllocationAmount: number;
    categoriesCount: number;
  };
  getCategoryStats: (categoryId: string) => {
    spent: number;
    remaining: number;
    usedPercentage: number;
    status: 'safe' | 'warning' | 'danger' | 'overspent';
  };
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [monthsData, setMonthsData] = useState<Record<string, MonthData>>({});
  const [currentMonthId, setCurrentMonthId] = useState<string>('');
  const [settings, setSettings] = useState<UserSettings>({ currency: 'INR', theme: 'light' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedMonths = localStorage.getItem('budget_tracker_months');
      const storedSettings = localStorage.getItem('budget_tracker_settings');
      const storedCurrentMonth = localStorage.getItem('budget_tracker_current_month');

      if (storedMonths) {
        setMonthsData(JSON.parse(storedMonths));
      }
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        
        // Apply theme immediately
        if (parsedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      }
      if (storedCurrentMonth) {
        setCurrentMonthId(storedCurrentMonth);
      } else if (storedMonths) {
        // Fallback: Set to the most recent month key
        const keys = Object.keys(JSON.parse(storedMonths));
        if (keys.length > 0) {
          // Sort keys (YYYY-MM) in descending order to pick the latest
          keys.sort((a, b) => b.localeCompare(a));
          setCurrentMonthId(keys[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('budget_tracker_months', JSON.stringify(monthsData));
    }
  }, [monthsData, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('budget_tracker_settings', JSON.stringify(settings));
      
      // Update theme classes
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [settings, isLoading]);

  useEffect(() => {
    if (!isLoading && currentMonthId) {
      localStorage.setItem('budget_tracker_current_month', currentMonthId);
    }
  }, [currentMonthId, isLoading]);

  // Current Month Data Selector
  const currentMonthData = useMemo(() => {
    return monthsData[currentMonthId];
  }, [monthsData, currentMonthId]);

  // Calculations for current month stats
  const overallStats = useMemo(() => {
    if (!currentMonthData) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        usedPercentage: 0,
        allocatedBudget: 0,
        unallocatedBudget: 0,
        isOverAllocated: false,
        overAllocationAmount: 0,
        categoriesCount: 0,
      };
    }

    const totalBudget = currentMonthData.totalBudget;
    const totalSpent = currentMonthData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRemaining = totalBudget - totalSpent;
    const usedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    const allocatedBudget = currentMonthData.categories.reduce((sum, cat) => sum + cat.budget, 0);
    const unallocatedBudget = Math.max(0, totalBudget - allocatedBudget);
    const isOverAllocated = allocatedBudget > totalBudget;
    const overAllocationAmount = isOverAllocated ? allocatedBudget - totalBudget : 0;
    
    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      usedPercentage,
      allocatedBudget,
      unallocatedBudget,
      isOverAllocated,
      overAllocationAmount,
      categoriesCount: currentMonthData.categories.length,
    };
  }, [currentMonthData]);

  // Calculations for individual category stats
  const getCategoryStats = (categoryId: string) => {
    if (!currentMonthData) {
      return { spent: 0, remaining: 0, usedPercentage: 0, status: 'safe' as const };
    }

    const category = currentMonthData.categories.find(cat => cat.id === categoryId);
    if (!category) {
      return { spent: 0, remaining: 0, usedPercentage: 0, status: 'safe' as const };
    }

    const spent = currentMonthData.expenses
      .filter(exp => exp.categoryId === categoryId)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const remaining = category.budget - spent;
    const usedPercentage = category.budget > 0 ? (spent / category.budget) * 100 : 0;

    let status: 'safe' | 'warning' | 'danger' | 'overspent' = 'safe';
    if (usedPercentage > 100) {
      status = 'overspent';
    } else if (usedPercentage > 90) {
      status = 'danger';
    } else if (usedPercentage >= 70) {
      status = 'warning';
    }

    return {
      spent,
      remaining,
      usedPercentage,
      status,
    };
  };

  // Month actions
  const createMonth = (monthId: string, totalBudget: number, copyFromMonthId?: string) => {
    const [year, month] = monthId.split('-').map(Number);
    
    let categories: Category[] = [];
    if (copyFromMonthId && monthsData[copyFromMonthId]) {
      // Deep copy categories but reset spent values (spent is calculated dynamically, budget is copied)
      categories = monthsData[copyFromMonthId].categories.map(cat => ({
        ...cat,
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      }));
    }

    const newMonth: MonthData = {
      id: monthId,
      month,
      year,
      totalBudget,
      categories,
      expenses: [],
    };

    setMonthsData(prev => ({
      ...prev,
      [monthId]: newMonth,
    }));
    setCurrentMonthId(monthId);
  };

  const updateTotalBudget = (monthId: string, budget: number) => {
    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          totalBudget: budget,
        },
      };
    });
  };

  const deleteMonth = (monthId: string) => {
    setMonthsData(prev => {
      const copy = { ...prev };
      delete copy[monthId];
      return copy;
    });

    // Auto-select another month if current deleted
    if (currentMonthId === monthId) {
      const keys = Object.keys(monthsData).filter(k => k !== monthId);
      if (keys.length > 0) {
        keys.sort((a, b) => b.localeCompare(a));
        setCurrentMonthId(keys[0]);
      } else {
        setCurrentMonthId('');
      }
    }
  };

  // Category Actions
  const addCategory = (monthId: string, name: string, icon: string, budget: number, color: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name,
      icon,
      budget,
      color,
    };

    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          categories: [...prev[monthId].categories, newCategory],
        },
      };
    });
  };

  const updateCategory = (monthId: string, categoryId: string, updates: Partial<Category>) => {
    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          categories: prev[monthId].categories.map(cat => 
            cat.id === categoryId ? { ...cat, ...updates } : cat
          ),
        },
      };
    });
  };

  const deleteCategory = (monthId: string, categoryId: string) => {
    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      // Delete the category and also all expenses in this category
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          categories: prev[monthId].categories.filter(cat => cat.id !== categoryId),
          expenses: prev[monthId].expenses.filter(exp => exp.categoryId !== categoryId),
        },
      };
    });
  };

  // Expense Actions
  const addExpense = (monthId: string, name: string, amount: number, categoryId: string, date: string, note?: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      name,
      amount,
      categoryId,
      date,
      note,
    };

    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          expenses: [...prev[monthId].expenses, newExpense],
        },
      };
    });
  };

  const updateExpense = (monthId: string, expenseId: string, updates: Partial<Expense>) => {
    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          expenses: prev[monthId].expenses.map(exp => 
            exp.id === expenseId ? { ...exp, ...updates } : exp
          ),
        },
      };
    });
  };

  const deleteExpense = (monthId: string, expenseId: string) => {
    setMonthsData(prev => {
      if (!prev[monthId]) return prev;
      return {
        ...prev,
        [monthId]: {
          ...prev[monthId],
          expenses: prev[monthId].expenses.filter(exp => exp.id !== expenseId),
        },
      };
    });
  };

  // Settings & Utility Actions
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const exportData = () => {
    return JSON.stringify({
      monthsData,
      currentMonthId,
      settings,
      version: '1.0'
    }, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      // Validate schema minimally
      if (parsed.monthsData && parsed.settings) {
        setMonthsData(parsed.monthsData);
        setSettings(parsed.settings);
        if (parsed.currentMonthId) {
          setCurrentMonthId(parsed.currentMonthId);
        } else {
          const keys = Object.keys(parsed.monthsData);
          if (keys.length > 0) {
            keys.sort((a, b) => b.localeCompare(a));
            setCurrentMonthId(keys[0]);
          }
        }
        return { success: true };
      }
      return { success: false, error: 'Invalid backup file structure' };
    } catch (e) {
      return { success: false, error: 'JSON parse error: ' + (e as Error).message };
    }
  };

  const resetAllData = () => {
    setMonthsData({});
    setCurrentMonthId('');
    setSettings({ currency: 'INR', theme: 'light' });
    localStorage.removeItem('budget_tracker_months');
    localStorage.removeItem('budget_tracker_settings');
    localStorage.removeItem('budget_tracker_current_month');
  };

  return (
    <BudgetContext.Provider value={{
      monthsData,
      currentMonthId,
      settings,
      isLoading,
      setCurrentMonthId,
      createMonth,
      updateTotalBudget,
      deleteMonth,
      addCategory,
      updateCategory,
      deleteCategory,
      addExpense,
      updateExpense,
      deleteExpense,
      updateSettings,
      exportData,
      importData,
      resetAllData,
      currentMonthData,
      overallStats,
      getCategoryStats,
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
