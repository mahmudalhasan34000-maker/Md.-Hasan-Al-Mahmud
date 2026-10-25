import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations, formatCurrency, formatPlainNumber } from '../i18n/translations';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  CheckSquare,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const {
    language,
    currency,
    debts,
    expenses,
    monthlyBudgets,
    selectedMonth,
    habits,
    activeHabitId,
    shoppingList,
    toggleShoppingItem,
    setActiveTab,
    openQuickAdd,
  } = useApp();

  const t = translations[language];

  // Active habit ticker
  const activeHabit = habits.find((h) => h.id === activeHabitId) || habits[0];
  const [elapsed, setElapsed] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!activeHabit) return;
    const calculateTime = () => {
      const diff = Math.max(0, Date.now() - activeHabit.startDate);
      const totalSecs = Math.floor(diff / 1000);
      const days = Math.floor(totalSecs / 86400);
      const hours = Math.floor((totalSecs % 86400) / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      setElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [activeHabit]);

  // Debt calculations
  const receivables = debts.filter((d) => d.type === 'receivable');
  const payables = debts.filter((d) => d.type === 'payable');

  const totalReceivable = receivables.reduce((sum, d) => sum + d.amount, 0);
  const totalReceivablePending = receivables
    .filter((d) => d.status !== 'settled')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalPayable = payables.reduce((sum, d) => sum + d.amount, 0);
  const totalPayablePending = payables
    .filter((d) => d.status !== 'settled')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const netBalance = totalReceivablePending - totalPayablePending;

  // Monthly Budget calculations
  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const totalSpent = monthExpenses
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthExpenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetLimit = monthlyBudgets[selectedMonth] || 35000;
  const budgetRatio = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;

  // Upcoming payables (pending payables sorted by due date)
  const upcomingPayables = payables
    .filter((p) => p.status !== 'settled')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 3);

  // Recent transactions
  const recentTransactions = [...expenses]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4);

  // Shopping list counts
  const totalShopping = shoppingList.length;
  const completedShopping = shoppingList.filter((i) => i.completed).length;
  const pendingShopping = shoppingList.filter((i) => !i.completed).slice(0, 3);

  // Habit savings calculation
  const habitDaysElapsed = Math.max(0, (Date.now() - (activeHabit?.startDate || Date.now())) / 86400000);
  const habitMoneySaved = Math.round(habitDaysElapsed * (activeHabit?.costPerDay || 0));

  // Determine budget alert status
  let budgetColor = 'bg-emerald-500';
  let budgetTextColor = 'text-emerald-700';
  let budgetBorderColor = 'border-emerald-200';
  let budgetBg = 'bg-emerald-50';
  let budgetMessage = t.expenses.statusSafe;

  if (budgetRatio >= 100) {
    budgetColor = 'bg-rose-500';
    budgetTextColor = 'text-rose-700';
    budgetBorderColor = 'border-rose-300';
    budgetBg = 'bg-rose-50';
    budgetMessage = t.expenses.statusOver;
  } else if (budgetRatio >= 90) {
    budgetColor = 'bg-red-500';
    budgetTextColor = 'text-red-700';
    budgetBorderColor = 'border-red-200';
    budgetBg = 'bg-red-50';
    budgetMessage = t.expenses.statusDanger;
  } else if (budgetRatio >= 70) {
    budgetColor = 'bg-amber-500';
    budgetTextColor = 'text-amber-700';
    budgetBorderColor = 'border-amber-200';
    budgetBg = 'bg-amber-50';
    budgetMessage = t.expenses.statusWarning;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {t.dashboard.greeting}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-xl">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => openQuickAdd('expense')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.dashboard.addExpense}</span>
            </button>
            <button
              onClick={() => openQuickAdd('receivable')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-xl backdrop-blur-xs border border-white/15 active:scale-95 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              <span>{t.dashboard.addReceivable}</span>
            </button>
            <button
              onClick={() => openQuickAdd('payable')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-3.5 py-2.5 rounded-xl backdrop-blur-xs border border-white/15 active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>{t.dashboard.addPayable}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Debt & Credit Duel Cards + Net Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Receivables Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {receivables.filter((r) => r.status !== 'settled').length}{' '}
              {language === 'bn' ? 'টি বকেয়া' : 'Pending'}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.receivablesTitle}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(totalReceivablePending, currency, language)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t.dashboard.receivablesDesc}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {language === 'bn' ? 'মোট দাবি:' : 'Total recorded:'}{' '}
              <span className="font-semibold text-slate-700">
                {formatCurrency(totalReceivable, currency, language)}
              </span>
            </span>
            <button
              onClick={() => setActiveTab('debts')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Payables Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
              {payables.filter((p) => p.status !== 'settled').length}{' '}
              {language === 'bn' ? 'টি ঋণ' : 'Active Debts'}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.dashboard.payablesTitle}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {formatCurrency(totalPayablePending, currency, language)}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{t.dashboard.payablesDesc}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {language === 'bn' ? 'মোট দেনা:' : 'Total recorded:'}{' '}
              <span className="font-semibold text-slate-700">
                {formatCurrency(totalPayable, currency, language)}
              </span>
            </span>
            <button
              onClick={() => setActiveTab('debts')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>

        {/* Net Debt Position */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className={`bg-white rounded-3xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between ${
            netBalance >= 0 ? 'border-teal-100' : 'border-amber-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                  netBalance >= 0
                    ? 'bg-teal-50 text-teal-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {netBalance >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  netBalance >= 0
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {netBalance >= 0 ? t.dashboard.iWillReceive : t.dashboard.iMustPay}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.dashboard.netDebtPosition}
              </p>
              <h3
                className={`text-2xl sm:text-3xl font-black mt-1 ${
                  netBalance >= 0 ? 'text-teal-700' : 'text-amber-700'
                }`}
              >
                {netBalance >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netBalance), currency, language)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {netBalance >= 0
                  ? language === 'bn'
                    ? 'পাওনা দেনার চেয়ে বেশি (নিরাপদ অবস্থান)'
                    : 'Receivables exceed payables'
                  : language === 'bn'
                    ? 'দেনা বেশি, ঋণ পরিশোধে অগ্রাধিকার দিন'
                    : 'Payables exceed receivables'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              {language === 'bn' ? 'সার্বিক ব্যালেন্স' : 'Summary status'}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Monthly Budget Progress Alert Bar */}
      <div className={`rounded-3xl p-6 border ${budgetBorderColor} ${budgetBg} shadow-sm transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                budgetRatio >= 90 ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              {budgetRatio >= 90 ? (
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {t.dashboard.monthlySpending}
                </h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${budgetTextColor} bg-white/80`}>
                  {formatPlainNumber(Math.round(budgetRatio), language)}%
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {budgetMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-xs text-slate-500">{t.expenses.spentSoFar}</div>
              <div className="text-lg font-black text-slate-900">
                {formatCurrency(totalSpent, currency, language)}
              </div>
            </div>
            <div className="text-slate-300 text-xl font-light">/</div>
            <div>
              <div className="text-xs text-slate-500">{t.expenses.monthlyLimit}</div>
              <div className="text-lg font-bold text-slate-700">
                {formatCurrency(budgetLimit, currency, language)}
              </div>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetRatio, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${budgetColor} shadow-xs`}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>
              {language === 'bn' ? 'বাকি বাজেট:' : 'Remaining:'}{' '}
              <strong className={budgetLimit - totalSpent < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                {formatCurrency(budgetLimit - totalSpent, currency, language)}
              </strong>
            </span>
            <button
              onClick={() => setActiveTab('expenses')}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'বাজেট বিশ্লেষণ' : 'Manage Budget'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Habit Streak Spotlight & Shopping Checklist Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bad Habit Streak Clock Spotlight */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-3xl p-6 border border-amber-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {language === 'bn' ? activeHabit?.nameBn || activeHabit?.name : activeHabit?.name}
                  </h4>
                  <p className="text-xs text-amber-800 font-medium">
                    {t.dashboard.habitStreak}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('habit')}
                className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                {t.dashboard.viewHabitTracker}
              </button>
            </div>

            {/* Live Ticking Counter Boxes */}
            <div className="mt-6 grid grid-cols-4 gap-2.5 text-center">
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/60 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {formatPlainNumber(elapsed.days, language)}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  {t.habit.days}
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/60 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {formatPlainNumber(String(elapsed.hours).padStart(2, '0'), language)}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  {t.habit.hours}
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/60 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                  {formatPlainNumber(String(elapsed.minutes).padStart(2, '0'), language)}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  {t.habit.mins}
                </span>
              </div>
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/60 shadow-xs ring-1 ring-amber-400">
                <span className="block text-2xl sm:text-3xl font-black text-amber-600 font-mono animate-pulse">
                  {formatPlainNumber(String(elapsed.seconds).padStart(2, '0'), language)}
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  {t.habit.secs}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-amber-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {t.habit.moneySaved}:{' '}
              <strong className="text-emerald-700 font-bold">
                {formatCurrency(habitMoneySaved, currency, language)}
              </strong>
            </span>
            <span className="text-amber-800 font-medium">
              {language === 'bn' ? 'অবিচল থাকুন!' : 'Stay disciplined!'}
            </span>
          </div>
        </div>

        {/* Shopping Checklist Mini Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {t.checklist.shoppingTab}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {totalShopping - completedShopping} {t.dashboard.itemsRemaining}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
              >
                {t.dashboard.viewAll}
              </button>
            </div>

            {/* Checklist items */}
            <div className="mt-4 space-y-2">
              {pendingShopping.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
                  {language === 'bn'
                    ? 'সব কেনাকাটা সম্পন্ন হয়েছে! নতুন আইটেম যোগ করুন।'
                    : 'All shopping items completed or list is clear!'}
                </div>
              ) : (
                pendingShopping.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleShoppingItem(item.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center text-transparent hover:border-emerald-500">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500 opacity-0 hover:opacity-100" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {item.name}
                      </span>
                    </div>
                    {item.estimatedCost && (
                      <span className="text-xs font-semibold text-slate-600">
                        {formatCurrency(item.estimatedCost, currency, language)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => openQuickAdd('shopping')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.dashboard.addShoppingItem}</span>
            </button>
            <span className="text-xs text-slate-400">
              {completedShopping}/{totalShopping} {language === 'bn' ? 'সম্পন্ন' : 'done'}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Upcoming Due Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-slate-900 text-base">
              {t.dashboard.recentTransactions}
            </h4>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {t.dashboard.noRecentTransactions}
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-bold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{' '}
                    {formatCurrency(tx.amount, currency, language)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Due Dates (Payables) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-extrabold text-slate-900 text-base">
              {t.dashboard.upcomingPayables}
            </h4>
            <button
              onClick={() => setActiveTab('debts')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingPayables.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-600">{t.dashboard.noUpcomingPayables}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingPayables.map((debt) => {
                const remaining = debt.amount - debt.paidAmount;
                const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date();
                return (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {debt.personName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span
                            className={
                              isOverdue
                                ? 'text-rose-600 font-bold'
                                : 'text-slate-500'
                            }
                          >
                            {debt.dueDate
                              ? `${language === 'bn' ? 'মেয়াদ:' : 'Due:'} ${debt.dueDate}`
                              : language === 'bn'
                              ? 'মেয়াদ নির্ধারিত নেই'
                              : 'No due date'}
                          </span>
                          {isOverdue && (
                            <span className="px-1.5 py-0.2 rounded-sm bg-rose-100 text-rose-800 text-[9px] font-bold">
                              {t.debts.overdue}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-rose-600">
                        {formatCurrency(remaining, currency, language)}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {debt.status === 'partially_paid'
                          ? t.debts.statusPartial
                          : t.debts.statusPending}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
