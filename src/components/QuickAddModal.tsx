import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../i18n/translations';
import { ExpenseCategory, IncomeCategory, PaymentMethod, DebtType } from '../types';
import { triggerConfetti } from '../utils/confetti';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  ShoppingBag,
  FileText,
  DollarSign,
  Calendar,
  User,
  Phone,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddInitialType,
    language,
    currency,
    addExpense,
    addDebt,
    addShoppingItem,
    addNote,
  } = useApp();

  const t = translations[language];

  const [activeFormType, setActiveFormType] = useState<
    'expense' | 'income' | 'receivable' | 'payable' | 'shopping' | 'note'
  >(quickAddInitialType);

  useEffect(() => {
    setActiveFormType(quickAddInitialType);
  }, [quickAddInitialType, isQuickAddOpen]);

  // Common Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Expense/Income Fields
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('groceries');
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('salary');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  // Debt Fields
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Shopping Fields
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Note Fields
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('emerald');

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setPersonName('');
    setPhoneNumber('');
    setDueDate('');
    setQuantity('');
    setNoteContent('');
  };

  const handleClose = () => {
    resetForm();
    setIsQuickAddOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeFormType === 'expense') {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0 || !title.trim()) return;
      addExpense({
        type: 'expense',
        title: title.trim(),
        amount: amt,
        category: expenseCategory,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else if (activeFormType === 'income') {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0 || !title.trim()) return;
      addExpense({
        type: 'income',
        title: title.trim(),
        amount: amt,
        category: incomeCategory,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else if (activeFormType === 'receivable' || activeFormType === 'payable') {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0 || !personName.trim()) return;
      addDebt({
        type: activeFormType as DebtType,
        personName: personName.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        amount: amt,
        date,
        dueDate: dueDate || undefined,
        note: notes.trim() || undefined,
      });
    } else if (activeFormType === 'shopping') {
      if (!title.trim()) return;
      addShoppingItem({
        name: title.trim(),
        quantity: quantity.trim() || undefined,
        estimatedCost: amount ? parseFloat(amount) : undefined,
        category: 'Shopping',
        completed: false,
        priority,
      });
    } else if (activeFormType === 'note') {
      if (!title.trim() && !noteContent.trim()) return;
      addNote({
        title: title.trim() || (language === 'bn' ? 'শিরোনামহীন নোট' : 'Untitled Note'),
        content: noteContent.trim(),
        color: noteColor,
        pinned: false,
        tags: ['Quick'],
      });
    }

    triggerConfetti();
    handleClose();
  };

  if (!isQuickAddOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header with Type selector */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {t.app.quickAdd}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn'
                ? 'নতুন খরচ, পাওনা, দেনা বা নোট দ্রুত যুক্ত করুন'
                : 'Log transactions, debts, or shopping items'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick form category tabs */}
        <div className="px-5 pt-3 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {[
            { id: 'expense', label: t.expenses.typeExpense, icon: ArrowUpRight, color: 'text-rose-600' },
            { id: 'income', label: t.expenses.typeIncome, icon: ArrowDownLeft, color: 'text-emerald-600' },
            { id: 'receivable', label: language === 'bn' ? 'পাওনা' : 'Receivable', icon: ArrowDownLeft, color: 'text-teal-600' },
            { id: 'payable', label: language === 'bn' ? 'দেনা' : 'Payable', icon: ArrowUpRight, color: 'text-rose-600' },
            { id: 'shopping', label: language === 'bn' ? 'ফর্দ' : 'Shopping', icon: ShoppingBag, color: 'text-indigo-600' },
            { id: 'note', label: language === 'bn' ? 'নোট' : 'Note', icon: FileText, color: 'text-amber-600' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFormType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFormType(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* EXPENSE & INCOME FORM */}
          {(activeFormType === 'expense' || activeFormType === 'income') && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.expenses.titleLabel} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeFormType === 'expense'
                      ? language === 'bn'
                        ? 'যেমন: কাঁচাবাজার, রিকশাভাড়া, দুপুরের খাবার'
                        : 'E.g. Weekly Groceries, Taxi fare'
                      : language === 'bn'
                      ? 'যেমন: মাসিক বেতন, বোনাস, প্রজেক্ট পেমেন্ট'
                      : 'E.g. Monthly Salary, Freelance project'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.amount} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.expenses.date}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.expenses.category}
                  </label>
                  {activeFormType === 'expense' ? (
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="groceries">{t.categories.groceries}</option>
                      <option value="housing">{t.categories.housing}</option>
                      <option value="utilities">{t.categories.utilities}</option>
                      <option value="dining">{t.categories.dining}</option>
                      <option value="transport">{t.categories.transport}</option>
                      <option value="health">{t.categories.health}</option>
                      <option value="education">{t.categories.education}</option>
                      <option value="shopping">{t.categories.shopping}</option>
                      <option value="entertainment">{t.categories.entertainment}</option>
                      <option value="debt_repayment">{t.categories.debt_repayment}</option>
                      <option value="others">{t.categories.others}</option>
                    </select>
                  ) : (
                    <select
                      value={incomeCategory}
                      onChange={(e) => setIncomeCategory(e.target.value as IncomeCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="salary">{t.categories.salary}</option>
                      <option value="business">{t.categories.business}</option>
                      <option value="freelance">{t.categories.freelance}</option>
                      <option value="gift">{t.categories.gift}</option>
                      <option value="debt_collected">{t.categories.debt_collected}</option>
                      <option value="investments">{t.categories.investments}</option>
                      <option value="others">{t.categories.others}</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.expenses.paymentMethod}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="cash">{t.paymentMethods.cash}</option>
                    <option value="bkash">{t.paymentMethods.bkash}</option>
                    <option value="nagad">{t.paymentMethods.nagad}</option>
                    <option value="rocket">{t.paymentMethods.rocket}</option>
                    <option value="bank">{t.paymentMethods.bank}</option>
                    <option value="card">{t.paymentMethods.card}</option>
                    <option value="other">{t.paymentMethods.other}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.debts.note}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'ঐচ্ছিক অতিরিক্ত বিবরণ...' : 'Optional details or note...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </>
          )}

          {/* RECEIVABLE & PAYABLE FORM */}
          {(activeFormType === 'receivable' || activeFormType === 'payable') && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.debts.personName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    language === 'bn' ? 'ব্যক্তির নাম বা প্রতিষ্ঠানের নাম' : "Person's name or contact"
                  }
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.amount} *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.phone}
                  </label>
                  <input
                    type="tel"
                    placeholder="01712-XXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.dateLent}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.dueDate}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.debts.note}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === 'bn' ? 'ধার দেওয়ার বা নেয়ার কারণ' : 'Reason / Note for this transaction'
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </>
          )}

          {/* SHOPPING ITEM FORM */}
          {activeFormType === 'shopping' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.checklist.itemName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: চাল, তেল, কফি' : 'E.g. Fresh milk, Rice'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.checklist.quantity}
                  </label>
                  <input
                    type="text"
                    placeholder="2 kg / 1 pc"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.checklist.estimatedCost}
                  </label>
                  <input
                    type="number"
                    placeholder="৳ 0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.checklist.priority}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="low">{t.checklist.priorityLow}</option>
                    <option value="medium">{t.checklist.priorityMedium}</option>
                    <option value="high">{t.checklist.priorityHigh}</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* NOTE FORM */}
          {activeFormType === 'note' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.checklist.noteTitle}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'নোটের শিরোনাম...' : 'Note title...'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.checklist.noteContent} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={language === 'bn' ? 'বিস্তারিত তথ্য লিখুন...' : 'Write your thoughts or reminders...'}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t.modals.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95 transition-all"
            >
              {t.modals.save}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
