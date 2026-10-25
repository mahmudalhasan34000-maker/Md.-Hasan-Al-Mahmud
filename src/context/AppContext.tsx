import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  Currency,
  ExpenseItem,
  DebtItem,
  ShoppingItem,
  NoteItem,
  HabitItem,
  MonthlyBudgetConfig,
  DebtPaymentLog,
  RelapseLog,
} from '../types';
import { triggerConfetti } from '../utils/confetti';

interface AppContextType {
  // Config & Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  activeTab: 'dashboard' | 'debts' | 'expenses' | 'notes' | 'habit' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'debts' | 'expenses' | 'notes' | 'habit' | 'settings') => void;

  // Debts (Receivables & Payables)
  debts: DebtItem[];
  addDebt: (debt: Omit<DebtItem, 'id' | 'paidAmount' | 'status' | 'paymentLogs' | 'createdAt'>) => void;
  updateDebt: (id: string, updates: Partial<DebtItem>) => void;
  deleteDebt: (id: string) => void;
  markDebtSettled: (id: string) => void;
  recordDebtPayment: (debtId: string, amount: number, date: string, note?: string) => void;

  // Expenses & Budget
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  monthlyBudgets: MonthlyBudgetConfig;
  setMonthlyBudget: (yearMonth: string, amount: number) => void;
  setMonthlyBudgets: (yearMonth: string, amount: number) => void;
  selectedMonth: string; // "YYYY-MM"
  setSelectedMonth: (month: string) => void;

  // Shopping & Notes
  shoppingList: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void;
  toggleShoppingItem: (id: string) => void;
  deleteShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;
  convertShoppingToExpense: (item: ShoppingItem) => void;

  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Habit Tracker
  habits: HabitItem[];
  activeHabitId: string;
  setActiveHabitId: (id: string) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'relapseHistory'>) => void;
  resetHabitStreak: (habitId: string, reason?: string, trigger?: string) => void;
  updateHabitPledge: (habitId: string, pledge: string) => void;

  // Modal helpers
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddInitialType: 'expense' | 'receivable' | 'payable' | 'shopping' | 'note';
  openQuickAdd: (type?: 'expense' | 'receivable' | 'payable' | 'shopping' | 'note') => void;

  // Backup & Reset
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
  loadSampleDemoData: () => void;
  clearAllData: () => void;
}

const STORAGE_KEY_PREFIX = 'hishabkitab_v1_';

const getDefaultYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'habit-smoking',
    name: 'Smoking Abstinence',
    nameBn: 'ধূমপান মুক্ত জীবন',
    iconName: 'CigaretteOff',
    category: 'health',
    // 14 days and 8 hours ago
    startDate: Date.now() - (14 * 24 * 3600 * 1000 + 8 * 3600 * 1000),
    costPerDay: 200,
    timeSavedMinutesPerDay: 40,
    relapseHistory: [],
    pledge: 'I choose fresh lungs, clean breath, and healthy longevity for my family.',
    pledgeBn: 'আমি পরিষ্কার ফুসফুস, স্বাস্থ্যবান দীর্ঘায়ু এবং পরিবারের সুখ বেছে নিয়েছি।',
  },
  {
    id: 'habit-sugar',
    name: 'No Refined Sugar & Junk Food',
    nameBn: 'চিনি ও অতিরিক্ত মিষ্টি বর্জন',
    iconName: 'Apple',
    category: 'health',
    startDate: Date.now() - (5 * 24 * 3600 * 1000 + 4 * 3600 * 1000),
    costPerDay: 150,
    timeSavedMinutesPerDay: 20,
    relapseHistory: [],
    pledge: 'Nourishing my body with natural wholesome food.',
    pledgeBn: 'প্রাকৃতিক ও পুষ্টিকর খাবার গ্রহণ করে শরীর সুস্থ রাখবো।',
  },
  {
    id: 'habit-screen',
    name: 'Late Night Screen Time & Doomscrolling',
    nameBn: 'দেরিতে ঘুমানো ও ফোন আসক্তি',
    iconName: 'Moon',
    category: 'lifestyle',
    startDate: Date.now() - (3 * 24 * 3600 * 1000 + 12 * 3600 * 1000),
    costPerDay: 0,
    timeSavedMinutesPerDay: 90,
    relapseHistory: [],
    pledge: 'Phone off by 11 PM for restful, deep regenerative sleep.',
    pledgeBn: 'রাত ১১টার আগেই ফোন রেখে শান্ত ও গভীর ঘুমে যাবো।',
  },
  {
    id: 'habit-spending',
    name: 'No Impulse Buying / Overspending',
    nameBn: 'অপ্রয়োজনীয় কেনাকাটা ও অপচয় বন্ধ',
    iconName: 'ShoppingBag',
    category: 'finance',
    startDate: Date.now() - (9 * 24 * 3600 * 1000 + 18 * 3600 * 1000),
    costPerDay: 350,
    timeSavedMinutesPerDay: 30,
    relapseHistory: [],
    pledge: 'Pausing 48 hours before any non-essential purchase.',
    pledgeBn: 'যেকোনো অপ্রয়োজনীয় কেনাকাটার আগে ৪৮ ঘণ্টা ভেবে সিদ্ধান্ত নেব।',
  },
];

export const SAMPLE_DEBTS: DebtItem[] = [
  {
    id: 'debt-rec-1',
    type: 'receivable',
    personName: 'Rahim Ahmed (রাহিম আহমেদ)',
    phoneNumber: '01712-345678',
    amount: 15000,
    paidAmount: 5000,
    status: 'partially_paid',
    date: '2026-10-05',
    dueDate: '2026-11-10',
    note: 'Emergency medical loan assistance',
    paymentLogs: [
      { id: 'pay-1', amount: 5000, date: '2026-10-15', note: 'Sent via bKash' },
    ],
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'debt-rec-2',
    type: 'receivable',
    personName: 'Tanvir Hossain (তানভীর)',
    phoneNumber: '01819-987654',
    amount: 6500,
    paidAmount: 0,
    status: 'pending',
    date: '2026-10-18',
    dueDate: '2026-10-31',
    note: 'Split for group travel booking & resort rent',
    paymentLogs: [],
    createdAt: Date.now() - 7 * 86400000,
  },
  {
    id: 'debt-rec-3',
    type: 'receivable',
    personName: 'Sumon Mia (সুমন মিয়া)',
    phoneNumber: '01911-112233',
    amount: 3000,
    paidAmount: 3000,
    status: 'settled',
    date: '2026-09-12',
    dueDate: '2026-10-01',
    note: 'Office lunch advance payment',
    paymentLogs: [
      { id: 'pay-2', amount: 3000, date: '2026-09-30', note: 'Cash cleared' },
    ],
    createdAt: Date.now() - 40 * 86400000,
  },
  {
    id: 'debt-pay-1',
    type: 'payable',
    personName: 'Dr. Kamal / House Owner (বাড়িওয়ালা)',
    phoneNumber: '01552-445566',
    amount: 22000,
    paidAmount: 0,
    status: 'pending',
    date: '2026-10-01',
    dueDate: '2026-11-05',
    note: 'Flat rent and service maintenance charge',
    paymentLogs: [],
    createdAt: Date.now() - 24 * 86400000,
  },
  {
    id: 'debt-pay-2',
    type: 'payable',
    personName: 'Hasan Grocery Store (মুদি দোকান)',
    phoneNumber: '01678-889900',
    amount: 3800,
    paidAmount: 1000,
    status: 'partially_paid',
    date: '2026-10-12',
    dueDate: '2026-10-30',
    note: 'Monthly credit khata for provisions',
    paymentLogs: [
      { id: 'pay-3', amount: 1000, date: '2026-10-20', note: 'Cash payment' }
    ],
    createdAt: Date.now() - 13 * 86400000,
  },
  {
    id: 'debt-pay-3',
    type: 'payable',
    personName: 'City Bank Credit Card (ক্রেডিট কার্ড)',
    amount: 11200,
    paidAmount: 11200,
    status: 'settled',
    date: '2026-09-25',
    dueDate: '2026-10-15',
    note: 'Electronic appliances installment cleared',
    paymentLogs: [
      { id: 'pay-4', amount: 11200, date: '2026-10-14', note: 'Bank transfer auto-debit' }
    ],
    createdAt: Date.now() - 30 * 86400000,
  },
];

export const SAMPLE_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    type: 'income',
    title: 'Monthly Salary (মাসিক বেতন)',
    amount: 65000,
    category: 'salary',
    date: '2026-10-01',
    paymentMethod: 'bank',
    notes: 'Direct corporate deposit',
    createdAt: Date.now() - 24 * 86400000,
  },
  {
    id: 'exp-2',
    type: 'income',
    title: 'Freelance UI Design Project (ফ্রিল্যান্সিং)',
    amount: 18000,
    category: 'freelance',
    date: '2026-10-14',
    paymentMethod: 'bank',
    notes: 'Mobile app design deliverables',
    createdAt: Date.now() - 11 * 86400000,
  },
  {
    id: 'exp-3',
    type: 'expense',
    title: 'Monthly Kitchen Bazaar (চাল, ডাল, তেল ও বাজার)',
    amount: 6850,
    category: 'groceries',
    date: '2026-10-03',
    paymentMethod: 'cash',
    notes: 'Local market purchase',
    createdAt: Date.now() - 22 * 86400000,
  },
  {
    id: 'exp-4',
    type: 'expense',
    title: 'Electricity & Gas Utility Bill (বিদ্যুৎ ও গ্যাস বিল)',
    amount: 2850,
    category: 'utilities',
    date: '2026-10-08',
    paymentMethod: 'bkash',
    notes: 'Paid via bKash bill pay',
    createdAt: Date.now() - 17 * 86400000,
  },
  {
    id: 'exp-5',
    type: 'expense',
    title: 'High-speed Fiber WiFi (ইন্টারনেট বিল)',
    amount: 1200,
    category: 'utilities',
    date: '2026-10-10',
    paymentMethod: 'nagad',
    notes: 'Monthly 60mbps plan',
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'exp-6',
    type: 'expense',
    title: 'Family Dinner at Restaurant (পারিবারিক ডিনার)',
    amount: 3200,
    category: 'dining',
    date: '2026-10-16',
    paymentMethod: 'card',
    notes: 'Weekend dinner with family',
    createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: 'exp-7',
    type: 'expense',
    title: 'Daily Commute, Metro & CNG (যাতায়াত ও ভাড়া)',
    amount: 2450,
    category: 'transport',
    date: '2026-10-21',
    paymentMethod: 'cash',
    notes: 'Weekly transport recharge & fares',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'exp-8',
    type: 'expense',
    title: 'Prescription Medicines & Eye Drops (ওষুধ ও ড্রপ)',
    amount: 1650,
    category: 'health',
    date: '2026-10-23',
    paymentMethod: 'nagad',
    notes: 'Pharmacy bill',
    createdAt: Date.now() - 2 * 86400000,
  },
];

export const SAMPLE_SHOPPING: ShoppingItem[] = [
  {
    id: 'shop-1',
    name: 'Miniket Rice (২৫ কেজি চাল)',
    quantity: '25 kg',
    estimatedCost: 1850,
    actualCost: 1800,
    category: 'Groceries',
    completed: true,
    priority: 'high',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'shop-2',
    name: 'Soybean Oil 5L (সয়াবিন তেল ৫ লিটার)',
    quantity: '5 Liter',
    estimatedCost: 890,
    actualCost: 880,
    category: 'Groceries',
    completed: true,
    priority: 'high',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'shop-3',
    name: 'Organic Green Tea (অর্গানিক গ্রিন টি)',
    quantity: '1 Box',
    estimatedCost: 380,
    category: 'Health',
    completed: false,
    priority: 'medium',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'shop-4',
    name: 'LED Desk Reading Lamp (রিডিং ল্যাম্প)',
    quantity: '1 pc',
    estimatedCost: 1400,
    category: 'Household',
    completed: false,
    priority: 'high',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'shop-5',
    name: 'Almonds & Walnuts (কাঠবাদাম ও আখরোট)',
    quantity: '500g',
    estimatedCost: 750,
    category: 'Groceries',
    completed: false,
    priority: 'low',
    createdAt: Date.now() - 1 * 86400000,
  },
];

export const SAMPLE_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Q4 Financial Targets (৪র্থ প্রান্তিকের লক্ষ্য)',
    content: '1. Save at least 30% of monthly income in emergency fixed deposit.\n2. Do not buy gadgets unless strictly necessary.\n3. Clear Hassan Grocery bill by October 30th.\n4. Follow 48-hour pause rule for purchases > ৳ 2,000.',
    color: 'emerald',
    pinned: true,
    tags: ['Goals', 'Finance', 'Budget'],
    updatedAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'note-2',
    title: 'Apartment Maintenance & Bill Contacts',
    content: 'Building Caretaker: 01711-223344\nElectrician Kabir: 01822-556677\nWater Meter Reading on 28th of every month.',
    color: 'amber',
    pinned: false,
    tags: ['Home', 'Utilities'],
    updatedAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'note-3',
    title: 'Habit Sobriety Affirmation (প্রতিদিনের প্রতিজ্ঞা)',
    content: '"Discipline is the bridge between goals and accomplishment." When feeling craving or stress, take 5 deep slow breaths, drink a glass of ice water, and remember why you started.',
    color: 'indigo',
    pinned: true,
    tags: ['Mindset', 'Habits'],
    updatedAt: Date.now() - 4 * 86400000,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Language & Currency
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY_PREFIX + 'language') as Language) || 'bn';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem(STORAGE_KEY_PREFIX + 'currency') as Currency) || 'BDT';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'debts' | 'expenses' | 'notes' | 'habit' | 'settings'>('dashboard');

  // 2. Debts
  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'debts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_DEBTS;
  });

  // 3. Expenses & Budgets
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'expenses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_EXPENSES;
  });

  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudgetConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'monthly_budgets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const currentYM = getDefaultYearMonth();
    return { [currentYM]: 40000 };
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(getDefaultYearMonth);

  // 4. Shopping & Notes
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'shopping');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_SHOPPING;
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return SAMPLE_NOTES;
  });

  // 5. Habit Tracker
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'habits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_HABITS;
  });

  const [activeHabitId, setActiveHabitId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'active_habit_id') || 'habit-smoking';
  });

  // 6. Quick add modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<'expense' | 'receivable' | 'payable' | 'shopping' | 'note'>('expense');

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'monthly_budgets', JSON.stringify(monthlyBudgets));
  }, [monthlyBudgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'active_habit_id', activeHabitId);
  }, [activeHabitId]);

  // Setters
  const setLanguage = (lang: Language) => setLanguageState(lang);
  const setCurrency = (cur: Currency) => setCurrencyState(cur);

  // Debts Actions
  const addDebt = (item: Omit<DebtItem, 'id' | 'paidAmount' | 'status' | 'paymentLogs' | 'createdAt'>) => {
    const newDebt: DebtItem = {
      ...item,
      id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      paidAmount: 0,
      status: 'pending',
      paymentLogs: [],
      createdAt: Date.now(),
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const updateDebt = (id: string, updates: Partial<DebtItem>) => {
    setDebts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          // auto update status if amount changes
          if (updated.paidAmount >= updated.amount) {
            updated.status = 'settled';
          } else if (updated.paidAmount > 0) {
            updated.status = 'partially_paid';
          } else {
            updated.status = 'pending';
          }
          return updated;
        }
        return item;
      })
    );
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const markDebtSettled = (id: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const remaining = Math.max(0, d.amount - d.paidAmount);
          const newLog: DebtPaymentLog = {
            id: `pay-${Date.now()}`,
            amount: remaining,
            date: new Date().toISOString().split('T')[0],
            note: 'Marked fully settled',
          };
          return {
            ...d,
            paidAmount: d.amount,
            status: 'settled',
            paymentLogs: remaining > 0 ? [...d.paymentLogs, newLog] : d.paymentLogs,
          };
        }
        return d;
      })
    );
    triggerConfetti();
  };

  const recordDebtPayment = (debtId: string, amount: number, date: string, note?: string) => {
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newPaid = d.paidAmount + amount;
          const status = newPaid >= d.amount ? 'settled' : newPaid > 0 ? 'partially_paid' : 'pending';
          const newLog: DebtPaymentLog = {
            id: `pay-${Date.now()}`,
            amount,
            date,
            note,
          };
          return {
            ...d,
            paidAmount: newPaid,
            status,
            paymentLogs: [newLog, ...d.paymentLogs],
          };
        }
        return d;
      })
    );
    triggerConfetti();
  };

  // Expenses & Budgets Actions
  const addExpense = (item: Omit<ExpenseItem, 'id' | 'createdAt'>) => {
    const newItem: ExpenseItem = {
      ...item,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setExpenses((prev) => [newItem, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpense = (id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const setMonthlyBudget = (yearMonth: string, amount: number) => {
    setMonthlyBudgets((prev) => ({
      ...prev,
      [yearMonth]: Math.max(0, amount),
    }));
  };

  // Shopping & Notes Actions
  const addShoppingItem = (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: Date.now(),
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompletedShopping = () => {
    setShoppingList((prev) => prev.filter((item) => !item.completed));
  };

  const convertShoppingToExpense = (item: ShoppingItem) => {
    const expenseCost = item.actualCost || item.estimatedCost || 0;
    if (expenseCost > 0) {
      addExpense({
        type: 'expense',
        title: item.name + (item.quantity ? ` (${item.quantity})` : ''),
        amount: expenseCost,
        category: 'groceries',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: `Converted from shopping list`,
      });
    }
    // Mark as completed
    setShoppingList((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, completed: true, actualCost: expenseCost } : i))
    );
    triggerConfetti();
  };

  const addNote = (note: Omit<NoteItem, 'id' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n))
    );
  };

  // Habit Actions
  const addHabit = (item: Omit<HabitItem, 'id' | 'relapseHistory'>) => {
    const newHabit: HabitItem = {
      ...item,
      id: `habit-${Date.now()}`,
      relapseHistory: [],
    };
    setHabits((prev) => [...prev, newHabit]);
    setActiveHabitId(newHabit.id);
  };

  const resetHabitStreak = (habitId: string, reason?: string, trigger?: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const now = Date.now();
          const prevDuration = Math.max(0, now - h.startDate);
          const relapseEntry: RelapseLog = {
            id: `relapse-${now}`,
            timestamp: now,
            reason: reason || 'Unspecified trigger',
            trigger,
            previousDurationMs: prevDuration,
          };
          return {
            ...h,
            startDate: now,
            relapseHistory: [relapseEntry, ...h.relapseHistory],
          };
        }
        return h;
      })
    );
  };

  const updateHabitPledge = (habitId: string, pledge: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, pledge, pledgeBn: pledge } : h))
    );
  };

  const openQuickAdd = (type: 'expense' | 'receivable' | 'payable' | 'shopping' | 'note' = 'expense') => {
    setQuickAddInitialType(type);
    setIsQuickAddOpen(true);
  };

  // Backup & Import
  const exportDataJson = () => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      language,
      currency,
      debts,
      expenses,
      monthlyBudgets,
      shoppingList,
      notes,
      habits,
      activeHabitId,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `hishabkitab-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.debts) setDebts(data.debts);
      if (data.expenses) setExpenses(data.expenses);
      if (data.monthlyBudgets) setMonthlyBudgets(data.monthlyBudgets);
      if (data.shoppingList) setShoppingList(data.shoppingList);
      if (data.notes) setNotes(data.notes);
      if (data.habits) setHabits(data.habits);
      if (data.activeHabitId) setActiveHabitId(data.activeHabitId);
      if (data.currency) setCurrencyState(data.currency);
      if (data.language) setLanguageState(data.language);
      return true;
    } catch (err) {
      console.error('Import error', err);
      return false;
    }
  };

  const loadSampleDemoData = () => {
    setDebts(SAMPLE_DEBTS);
    setExpenses(SAMPLE_EXPENSES);
    setShoppingList(SAMPLE_SHOPPING);
    setNotes(SAMPLE_NOTES);
    setHabits(DEFAULT_HABITS);
    setActiveHabitId(DEFAULT_HABITS[0].id);
    const ym = getDefaultYearMonth();
    setMonthlyBudgets({ [ym]: 40000 });
    triggerConfetti();
  };

  const clearAllData = () => {
    setDebts([]);
    setExpenses([]);
    setShoppingList([]);
    setNotes([]);
    setHabits(DEFAULT_HABITS.map((h) => ({ ...h, startDate: Date.now(), relapseHistory: [] })));
    setMonthlyBudgets({ [getDefaultYearMonth()]: 30000 });
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        activeTab,
        setActiveTab,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        markDebtSettled,
        recordDebtPayment,
        expenses,
        addExpense,
        deleteExpense,
        updateExpense,
        monthlyBudgets,
        setMonthlyBudget,
        setMonthlyBudgets: setMonthlyBudget,
        selectedMonth,
        setSelectedMonth,
        shoppingList,
        addShoppingItem,
        toggleShoppingItem,
        deleteShoppingItem,
        clearCompletedShopping,
        convertShoppingToExpense,
        notes,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        habits,
        activeHabitId,
        setActiveHabitId,
        addHabit,
        resetHabitStreak,
        updateHabitPledge,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddInitialType,
        openQuickAdd,
        exportDataJson,
        importDataJson,
        loadSampleDemoData,
        clearAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
