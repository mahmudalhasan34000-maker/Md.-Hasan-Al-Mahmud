import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, formatCurrency } from '../i18n/translations';
import { DebtType, DebtStatus, DebtItem } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle,
  Calendar,
  User,
  Phone,
  FileText,
  Clock,
  Trash2,
  DollarSign,
  Layers,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DebtTracker: React.FC = () => {
  const {
    language,
    currency,
    debts,
    addDebt,
    deleteDebt,
    markDebtSettled,
    recordDebtPayment,
    openQuickAdd,
  } = useApp();

  const t = translations[language];

  const [activeSubTab, setActiveSubTab] = useState<'receivables' | 'payables' | 'summary'>('receivables');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment Recording Modal State
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<DebtItem | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentDateInput, setPaymentDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNoteInput, setPaymentNoteInput] = useState('');

  // Calculations
  const receivables = debts.filter((d) => d.type === 'receivable');
  const payables = debts.filter((d) => d.type === 'payable');

  const totalReceivableGross = receivables.reduce((sum, d) => sum + d.amount, 0);
  const totalReceivableCollected = receivables.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalReceivablePending = totalReceivableGross - totalReceivableCollected;

  const totalPayableGross = payables.reduce((sum, d) => sum + d.amount, 0);
  const totalPayableCleared = payables.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalPayablePending = totalPayableGross - totalPayableCleared;

  const netBalance = totalReceivablePending - totalPayablePending;

  // Filtered lists
  const currentList = activeSubTab === 'receivables' ? receivables : payables;

  const filteredItems = currentList.filter((item) => {
    // Status filter
    if (filterStatus === 'pending' && item.status === 'settled') return false;
    if (filterStatus === 'settled' && item.status !== 'settled') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.personName.toLowerCase().includes(q);
      const matchNote = item.note ? item.note.toLowerCase().includes(q) : false;
      const matchPhone = item.phoneNumber ? item.phoneNumber.includes(q) : false;
      return matchName || matchNote || matchPhone;
    }
    return true;
  });

  const handleOpenPaymentModal = (debt: DebtItem) => {
    const remaining = debt.amount - debt.paidAmount;
    setSelectedDebtForPayment(debt);
    setPaymentAmountInput(String(remaining));
    setPaymentDateInput(new Date().toISOString().split('T')[0]);
    setPaymentNoteInput('');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment) return;
    const amount = parseFloat(paymentAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    recordDebtPayment(selectedDebtForPayment.id, amount, paymentDateInput, paymentNoteInput);
    setSelectedDebtForPayment(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.debts.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t.debts.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('receivable')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>{t.debts.btnNewReceivable}</span>
          </button>
          <button
            onClick={() => openQuickAdd('payable')}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>{t.debts.btnNewPayable}</span>
          </button>
        </div>
      </div>

      {/* Summary Scoreboard Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receivables summary */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              {t.debts.totalReceivable} ({language === 'bn' ? 'বাকি' : 'Pending'})
            </span>
            <span className="text-2xl font-black text-emerald-700">
              {formatCurrency(totalReceivablePending, currency, language)}
            </span>
            <div className="text-[11px] text-emerald-600 mt-0.5">
              {language === 'bn' ? 'আদায় হয়েছে:' : 'Collected:'}{' '}
              {formatCurrency(totalReceivableCollected, currency, language)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        {/* Payables summary */}
        <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
              {t.debts.totalPayable} ({language === 'bn' ? 'বাকি' : 'Pending'})
            </span>
            <span className="text-2xl font-black text-rose-700">
              {formatCurrency(totalPayablePending, currency, language)}
            </span>
            <div className="text-[11px] text-rose-600 mt-0.5">
              {language === 'bn' ? 'পরিশোধ হয়েছে:' : 'Paid off:'}{' '}
              {formatCurrency(totalPayableCleared, currency, language)}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-200/60 text-rose-800 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        {/* Net Balance summary */}
        <div
          className={`border rounded-2xl p-4 flex items-center justify-between ${
            netBalance >= 0
              ? 'bg-teal-50/80 border-teal-200/80'
              : 'bg-amber-50/80 border-amber-200/80'
          }`}
        >
          <div>
            <span
              className={`text-xs font-semibold uppercase tracking-wider block ${
                netBalance >= 0 ? 'text-teal-800' : 'text-amber-800'
              }`}
            >
              {t.debts.netBalance}
            </span>
            <span
              className={`text-2xl font-black ${
                netBalance >= 0 ? 'text-teal-700' : 'text-amber-700'
              }`}
            >
              {netBalance >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netBalance), currency, language)}
            </span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {t.debts.netBalanceDesc}
            </div>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
              netBalance >= 0 ? 'bg-teal-200/60 text-teal-800' : 'bg-amber-200/60 text-amber-800'
            }`}
          >
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Navigation sub-tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('receivables')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'receivables'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>{t.debts.receivablesTab}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
              {receivables.filter((r) => r.status !== 'settled').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('payables')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'payables'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>{t.debts.payablesTab}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800">
              {payables.filter((p) => p.status !== 'settled').length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('summary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'summary'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>{t.debts.summaryTab}</span>
          </button>
        </div>

        {/* Search & Status filters (when not on summary tab) */}
        {activeSubTab !== 'summary' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.debts.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Filter Pill Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
              {(['all', 'pending', 'settled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                    filterStatus === st
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {st === 'all'
                    ? t.debts.filterAll
                    : st === 'pending'
                    ? t.debts.filterPending
                    : t.debts.filterSettled}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content View */}
      {activeSubTab === 'summary' ? (
        /* Summary & Comparison Dashboard */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              {language === 'bn' ? 'দেনা ও পাওনার বিস্তারিত বিশ্লেষণ' : 'Detailed Debt-Credit Comparison'}
            </h3>

            {/* Progress comparison bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <ArrowDownLeft className="w-4 h-4" />
                    {t.debts.receivablesTab} ({language === 'bn' ? 'আদায় অনুপাত' : 'Recovery Rate'})
                  </span>
                  <span>
                    {formatCurrency(totalReceivableCollected, currency, language)} /{' '}
                    {formatCurrency(totalReceivableGross, currency, language)} (
                    {totalReceivableGross > 0
                      ? Math.round((totalReceivableCollected / totalReceivableGross) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalReceivableGross > 0
                          ? Math.min(100, (totalReceivableCollected / totalReceivableGross) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <ArrowUpRight className="w-4 h-4" />
                    {t.debts.payablesTab} ({language === 'bn' ? 'পরিশোধ অনুপাত' : 'Repayment Rate'})
                  </span>
                  <span>
                    {formatCurrency(totalPayableCleared, currency, language)} /{' '}
                    {formatCurrency(totalPayableGross, currency, language)} (
                    {totalPayableGross > 0
                      ? Math.round((totalPayableCleared / totalPayableGross) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totalPayableGross > 0
                          ? Math.min(100, (totalPayableCleared / totalPayableGross) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quick overview grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
              <div className="p-4 rounded-2xl bg-slate-50">
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'bn' ? 'মোট পাওনা রেকর্ড' : 'Total Receivables Count'}
                </span>
                <span className="block text-2xl font-black text-slate-900 mt-1">
                  {receivables.length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50">
                <span className="text-xs text-emerald-800 font-medium">
                  {language === 'bn' ? 'পরিশোধিত পাওনা' : 'Settled Receivables'}
                </span>
                <span className="block text-2xl font-black text-emerald-700 mt-1">
                  {receivables.filter((r) => r.status === 'settled').length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'bn' ? 'মোট দেনা রেকর্ড' : 'Total Payables Count'}
                </span>
                <span className="block text-2xl font-black text-slate-900 mt-1">
                  {payables.length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50">
                <span className="text-xs text-rose-800 font-medium">
                  {language === 'bn' ? 'পরিশোধিত ঋণ' : 'Settled Debts'}
                </span>
                <span className="block text-2xl font-black text-rose-700 mt-1">
                  {payables.filter((p) => p.status === 'settled').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List of Receivables or Payables Cards */
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                {activeSubTab === 'receivables' ? (
                  <ArrowDownLeft className="w-7 h-7" />
                ) : (
                  <ArrowUpRight className="w-7 h-7" />
                )}
              </div>
              <h4 className="font-bold text-slate-800 text-base">
                {activeSubTab === 'receivables' ? t.debts.noReceivables : t.debts.noPayables}
              </h4>
              <button
                onClick={() => openQuickAdd(activeSubTab === 'receivables' ? 'receivable' : 'payable')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {activeSubTab === 'receivables'
                    ? t.debts.btnNewReceivable
                    : t.debts.btnNewPayable}
                </span>
              </button>
            </div>
          ) : (
            filteredItems.map((debt) => {
              const remaining = debt.amount - debt.paidAmount;
              const isSettled = debt.status === 'settled';
              const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !isSettled;

              return (
                <motion.div
                  key={debt.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                    isSettled
                      ? 'border-slate-200/60 bg-slate-50/50 opacity-80'
                      : activeSubTab === 'receivables'
                      ? 'border-emerald-200/80 hover:border-emerald-300 shadow-xs'
                      : 'border-rose-200/80 hover:border-rose-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Person info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isSettled
                            ? 'bg-slate-100 text-slate-500'
                            : activeSubTab === 'receivables'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base">
                            {debt.personName}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              isSettled
                                ? 'bg-slate-200 text-slate-700'
                                : debt.status === 'partially_paid'
                                ? 'bg-amber-100 text-amber-800'
                                : activeSubTab === 'receivables'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {debt.status === 'settled'
                              ? t.debts.statusSettled
                              : debt.status === 'partially_paid'
                              ? t.debts.statusPartial
                              : t.debts.statusPending}
                          </span>

                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 animate-pulse">
                              {t.debts.overdue}
                            </span>
                          )}
                        </div>

                        {/* Note & Phone */}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {debt.phoneNumber && (
                            <span className="flex items-center gap-1 font-mono text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {debt.phoneNumber}
                            </span>
                          )}
                          {debt.note && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="line-clamp-1">{debt.note}</span>
                            </span>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t.debts.dateLent}: {debt.date}
                          </span>
                          {debt.dueDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue ? 'text-red-600 font-semibold' : ''
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {t.debts.dueDate}: {debt.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial details & Action Buttons */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div>
                        <div className="text-right sm:text-right">
                          <span className="text-xs text-slate-400 block">
                            {isSettled ? t.debts.paidAmount : t.debts.remaining}
                          </span>
                          <span
                            className={`text-xl font-black ${
                              isSettled
                                ? 'text-slate-500 line-through'
                                : activeSubTab === 'receivables'
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {formatCurrency(isSettled ? debt.amount : remaining, currency, language)}
                          </span>
                        </div>
                        {debt.paidAmount > 0 && !isSettled && (
                          <div className="text-[11px] text-slate-500 text-right">
                            {language === 'bn' ? 'আদায় হয়েছে: ' : 'Paid: '}
                            {formatCurrency(debt.paidAmount, currency, language)} /{' '}
                            {formatCurrency(debt.amount, currency, language)}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 mt-1">
                        {!isSettled && (
                          <>
                            <button
                              onClick={() => handleOpenPaymentModal(debt)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                              title={t.debts.logPartialPayment}
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>{t.debts.logPartialPayment}</span>
                            </button>
                            <button
                              onClick={() => markDebtSettled(debt.id)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1"
                              title={t.debts.markSettled}
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'পরিশোধ' : 'Settle'}</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(t.debts.deleteConfirm)) {
                              deleteDebt(debt.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment history dropdown snippet if any */}
                  {debt.paymentLogs && debt.paymentLogs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.debts.historyTitle} ({debt.paymentLogs.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {debt.paymentLogs.map((log) => (
                          <span
                            key={log.id}
                            className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] text-slate-600"
                          >
                            <span className="font-bold text-slate-800">
                              {formatCurrency(log.amount, currency, language)}
                            </span>
                            <span>• {log.date}</span>
                            {log.note && <span className="italic text-slate-500">({log.note})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Record Payment Dialog */}
      <AnimatePresence>
        {selectedDebtForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {t.debts.recordPaymentTitle} {selectedDebtForPayment.personName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {language === 'bn' ? 'বকেয়া পরিমাণ:' : 'Remaining balance:'}{' '}
                <strong className="text-emerald-700 font-bold">
                  {formatCurrency(
                    selectedDebtForPayment.amount - selectedDebtForPayment.paidAmount,
                    currency,
                    language
                  )}
                </strong>
              </p>

              <form onSubmit={handleSavePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.paymentAmount}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.paymentDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDateInput}
                    onChange={(e) => setPaymentDateInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.debts.paymentNote}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: বিকাশ বা ক্যাশ গ্রহণ' : 'E.g. via bKash / Cash'}
                    value={paymentNoteInput}
                    onChange={(e) => setPaymentNoteInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedDebtForPayment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {t.modals.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    {t.debts.savePayment}
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
