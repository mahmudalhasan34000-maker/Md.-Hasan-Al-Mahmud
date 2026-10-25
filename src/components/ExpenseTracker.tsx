import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, formatCurrency, formatPlainNumber } from '../i18n/translations';
import { ExpenseCategory, IncomeCategory, PaymentMethod } from '../types';
import {
  PieChart,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  DollarSign,
  ShoppingBag,
  Home,
  Zap,
  Coffee,
  Car,
  HeartPulse,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Briefcase,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  groceries: ShoppingBag,
  housing: Home,
  utilities: Zap,
  dining: Coffee,
  transport: Car,
  health: HeartPulse,
  education: GraduationCap,
  shopping: ShoppingBag,
  entertainment: Sparkles,
  debt_repayment: TrendingDown,
  others: HelpCircle,
  salary: Briefcase,
  business: Briefcase,
  freelance: Sparkles,
  gift: Gift,
  debt_collected: TrendingUp,
  investments: TrendingUp,
};

export const ExpenseTracker: React.FC = () => {
  const {
    language,
    currency,
    expenses,
    deleteExpense,
    monthlyBudgets,
    setMonthlyBudgets,
    selectedMonth,
    setSelectedMonth,
    openQuickAdd,
  } = useApp();

  const t = translations[language];

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    setSelectedMonth(`${year}-${String(month).padStart(2, '0')}`);
  };

  const currentBudget = monthlyBudgets[selectedMonth] || 35000;

  // Month's transactions
  const monthTransactions = expenses.filter((e) => e.date.startsWith(selectedMonth));

  const totalSpent = monthTransactions
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = monthTransactions
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const netSavings = totalIncome - totalSpent;

  const budgetRatio = currentBudget > 0 ? (totalSpent / currentBudget) * 100 : 0;
  const budgetRemaining = currentBudget - totalSpent;

  // Calculate day-based projections
  const [y, m] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();
  const isCurrentViewingMonth =
    today.getFullYear() === y && today.getMonth() + 1 === m;
  const daysPassed = isCurrentViewingMonth ? Math.max(1, today.getDate()) : daysInMonth;

  const dailyAverage = Math.round(totalSpent / daysPassed);
  const projectedTotal = dailyAverage * daysInMonth;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  monthTransactions
    .filter((e) => e.type === 'expense')
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  // Color alerts
  let alertBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let progressFillClass = 'bg-emerald-500';
  let alertMessage = t.expenses.statusSafe;
  let alertIcon = CheckCircle2;

  if (budgetRatio >= 100) {
    alertBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
    progressFillClass = 'bg-rose-600';
    alertMessage = `${t.expenses.statusOver} (${formatCurrency(totalSpent - currentBudget, currency, language)} ${t.expenses.overBudgetBy})`;
    alertIcon = AlertTriangle;
  } else if (budgetRatio >= 90) {
    alertBadgeClass = 'bg-red-100 text-red-800 border-red-300';
    progressFillClass = 'bg-red-500';
    alertMessage = t.expenses.statusDanger;
    alertIcon = AlertTriangle;
  } else if (budgetRatio >= 70) {
    alertBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    progressFillClass = 'bg-amber-500';
    alertMessage = t.expenses.statusWarning;
    alertIcon = AlertTriangle;
  }

  const AlertIconComponent = alertIcon;

  // Filtered transactions
  const filteredTransactions = monthTransactions.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    return true;
  });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      setMonthlyBudgets(selectedMonth, val);
      setIsEditingBudget(false);
    }
  };

  // Month Display Name
  const dateObj = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1, 1);
  const formattedMonthName = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.expenses.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t.expenses.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector navigation */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold text-slate-800 min-w-[130px] text-center">
              {formattedMonthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openQuickAdd('expense')}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.expenses.btnAddExpense}</span>
          </button>
        </div>
      </div>

      {/* Monthly Budget Card with Animated Progress Bar & Alert */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t.expenses.monthlyLimit}
              </span>
              <button
                onClick={() => {
                  setBudgetInput(String(currentBudget));
                  setIsEditingBudget(true);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <Edit2 className="w-3 h-3" />
                <span>{t.expenses.editLimit}</span>
              </button>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900">
                {formatCurrency(totalSpent, currency, language)}
              </h3>
              <span className="text-slate-400 font-semibold text-lg">
                / {formatCurrency(currentBudget, currency, language)}
              </span>
            </div>
          </div>

          {/* Alert pill */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold shadow-2xs ${alertBadgeClass}`}
          >
            <AlertIconComponent className="w-4 h-4 shrink-0" />
            <span>{alertMessage}</span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-6">
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetRatio, 100)}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className={`h-full rounded-full ${progressFillClass} shadow-xs relative`}
            />
          </div>

          {/* Indicators row below progress bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium text-slate-600 gap-2">
            <span>
              {language === 'bn' ? 'ব্যবহৃত:' : 'Budget Used:'}{' '}
              <strong className="text-slate-900 font-bold">
                {formatPlainNumber(Math.round(budgetRatio), language)}%
              </strong>
            </span>
            <span>
              {budgetRemaining >= 0 ? t.expenses.budgetRemaining : t.expenses.overBudgetBy}:{' '}
              <strong
                className={`font-bold ${
                  budgetRemaining >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatCurrency(Math.abs(budgetRemaining), currency, language)}
              </strong>
            </span>
            <span>
              {t.expenses.dailyAverage}:{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(dailyAverage, currency, language)} / {language === 'bn' ? 'দিন' : 'day'}
              </strong>
            </span>
            <span>
              {t.expenses.projectedMonthEnd}:{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(projectedTotal, currency, language)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Financial Metrics Strip: Income, Expenses, Net Savings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              {t.expenses.incomeTotal}
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {formatCurrency(totalIncome, currency, language)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
              {t.expenses.spentSoFar}
            </span>
            <span className="text-2xl font-black text-rose-700">
              {formatCurrency(totalSpent, currency, language)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-200/60 text-rose-800 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
              {t.expenses.netSavings}
            </span>
            <span
              className={`text-2xl font-black ${
                netSavings >= 0 ? 'text-indigo-700' : 'text-rose-700'
              }`}
            >
              {netSavings >= 0 ? '+' : ''}
              {formatCurrency(netSavings, currency, language)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-200/60 text-indigo-800 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Spending by Category Visual Breakdown */}
      {sortedCategories.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>{t.expenses.categoryBreakdown}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedCategories.map(([catKey, amount]) => {
              const Icon = CATEGORY_ICONS[catKey] || HelpCircle;
              const catPercent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
              const catLabel =
                translations[language].categories[catKey as ExpenseCategory] || catKey;

              return (
                <div
                  key={catKey}
                  onClick={() => setFilterCategory(filterCategory === catKey ? 'all' : catKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    filterCategory === catKey
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">
                        {catLabel}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      {formatCurrency(amount, currency, language)}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                    <span>{catPercent}% of spend</span>
                    {filterCategory === catKey && (
                      <span className="text-emerald-700 font-bold">Active filter</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Log Table / Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-base">
              {t.expenses.transactions} ({filteredTransactions.length})
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              {(['all', 'expense', 'income'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                    filterType === type
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'all'
                    ? language === 'bn'
                      ? 'সব'
                      : 'All'
                    : type === 'expense'
                    ? t.expenses.typeExpense
                    : t.expenses.typeIncome}
                </button>
              ))}
            </div>

            {/* Clear category filter if active */}
            {filterCategory !== 'all' && (
              <button
                onClick={() => setFilterCategory('all')}
                className="text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition-colors"
              >
                Clear category ({filterCategory}) ✕
              </button>
            )}
          </div>
        </div>

        {/* Transactions list */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
            {t.expenses.noTransactions}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const Icon = CATEGORY_ICONS[tx.category] || HelpCircle;
              const catLabel =
                translations[language].categories[tx.category as ExpenseCategory] || tx.category;
              const methodLabel =
                translations[language].paymentMethods[tx.paymentMethod] || tx.paymentMethod;

              return (
                <div
                  key={tx.id}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{tx.title}</h5>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{catLabel}</span>
                        <span>•</span>
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold">
                          {methodLabel}
                        </span>
                        {tx.notes && <span className="italic text-slate-400">({tx.notes})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-base font-black ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{' '}
                      {formatCurrency(tx.amount, currency, language)}
                    </span>
                    <button
                      onClick={() => deleteExpense(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Budget Modal */}
      <AnimatePresence>
        {isEditingBudget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {t.expenses.editLimit} ({formattedMonthName})
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {language === 'bn'
                  ? 'এই মাসের জন্য আপনার সর্বোচ্চ খরচ সীমা নির্ধারণ করুন।'
                  : 'Set your spending ceiling for this month.'}
              </p>

              <form onSubmit={handleSaveBudget} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.expenses.monthlyLimit}
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {t.modals.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    {t.expenses.saveLimit}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
