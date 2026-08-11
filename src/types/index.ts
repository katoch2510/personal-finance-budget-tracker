export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji or Lucide icon identifier
  budget: number;
  color: string; // Tailwind class background color or hex code
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface MonthData {
  id: string; // Format: "YYYY-MM"
  month: number; // 1-12
  year: number;
  totalBudget: number;
  categories: Category[];
  expenses: Expense[];
}

export interface UserSettings {
  currency: string; // e.g. "INR", "USD", "EUR"
  theme: 'light' | 'dark';
}
