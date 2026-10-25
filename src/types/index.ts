export type Language = 'en' | 'bn';

export type Currency = 'BDT' | 'USD' | 'EUR' | 'INR' | 'GBP';

export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'groceries'
  | 'housing'
  | 'utilities'
  | 'dining'
  | 'transport'
  | 'health'
  | 'education'
  | 'shopping'
  | 'entertainment'
  | 'debt_repayment'
  | 'others';

export type IncomeCategory =
  | 'salary'
  | 'business'
  | 'freelance'
  | 'gift'
  | 'debt_collected'
  | 'investments'
  | 'others';

export type PaymentMethod =
  | 'cash'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'bank'
  | 'card'
  | 'other';

export interface ExpenseItem {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export type DebtType = 'receivable' | 'payable'; // receivable = others owe me; payable = I owe others
export type DebtStatus = 'pending' | 'partially_paid' | 'settled';

export interface DebtPaymentLog {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface DebtItem {
  id: string;
  type: DebtType;
  personName: string;
  phoneNumber?: string;
  amount: number;
  paidAmount: number;
  status: DebtStatus;
  date: string; // created/lent date
  dueDate?: string;
  note?: string;
  paymentLogs: DebtPaymentLog[];
  createdAt: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  estimatedCost?: number;
  actualCost?: number;
  category: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  tags: string[];
  updatedAt: number;
}

export interface RelapseLog {
  id: string;
  timestamp: number;
  reason?: string;
  trigger?: string;
  previousDurationMs: number;
}

export interface HabitItem {
  id: string;
  name: string;
  nameBn: string;
  iconName: string;
  category: string;
  startDate: number; // timestamp in ms
  costPerDay?: number; // estimated money spent per day on this habit
  timeSavedMinutesPerDay?: number; // minutes per day saved
  relapseHistory: RelapseLog[];
  pledge?: string;
  pledgeBn?: string;
}

export interface MonthlyBudgetConfig {
  [yearMonth: string]: number; // e.g. "2026-10": 35000
}
