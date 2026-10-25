import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations, formatCurrency, formatPlainNumber } from '../i18n/translations';
import { HabitItem } from '../types';
import { triggerConfetti, triggerStreakCelebration } from '../utils/confetti';
import {
  Flame,
  RotateCcw,
  Plus,
  Award,
  Clock,
  DollarSign,
  TrendingUp,
  Heart,
  Quote,
  Shield,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Milestone {
  days: number;
  labelEn: string;
  labelBn: string;
  badge: string;
}

const MILESTONES: Milestone[] = [
  { days: 1, labelEn: '24 Hours', labelBn: '১ দিন (২৪ ঘণ্টা)', badge: '🌱 First Step' },
  { days: 3, labelEn: '3 Days', labelBn: '৩ দিন', badge: '🔥 Habit Breaker' },
  { days: 7, labelEn: '1 Week', labelBn: '১ সপ্তাহ', badge: '⚡ Willpower Master' },
  { days: 14, labelEn: '2 Weeks', labelBn: '২ সপ্তাহ', badge: '🛡️ Armor of Resilience' },
  { days: 30, labelEn: '1 Month', labelBn: '১ মাস (৩০ দিন)', badge: '🏆 Transformation' },
  { days: 60, labelEn: '2 Months', labelBn: '২ মাস', badge: '💎 Diamond Discipline' },
  { days: 90, labelEn: '90 Days', labelBn: '৩ মাস (৯০ দিন)', badge: '👑 Unstoppable New Self' },
  { days: 365, labelEn: '1 Year', labelBn: '১ বছর', badge: '🌟 Living Legend' },
];

export const HabitTracker: React.FC = () => {
  const {
    language,
    currency,
    habits,
    activeHabitId,
    setActiveHabitId,
    resetHabitStreak,
    addHabit,
    updateHabitPledge,
  } = useApp();

  const t = translations[language];

  const currentHabit = habits.find((h) => h.id === activeHabitId) || habits[0];

  // Live timer state
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  useEffect(() => {
    if (!currentHabit) return;

    const tick = () => {
      const now = Date.now();
      const diffMs = Math.max(0, now - currentHabit.startDate);
      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setElapsed({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: totalSec,
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [currentHabit?.startDate]);

  // Relapse modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [relapseReason, setRelapseReason] = useState('');
  const [relapseTrigger, setRelapseTrigger] = useState('');

  // Add custom habit modal state
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitNameBn, setNewHabitNameBn] = useState('');
  const [newHabitCost, setNewHabitCost] = useState('150');
  const [newHabitTime, setNewHabitTime] = useState('30');
  const [newHabitPledge, setNewHabitPledge] = useState('');

  // Pledge edit state
  const [isEditingPledge, setIsEditingPledge] = useState(false);
  const [pledgeInput, setPledgeInput] = useState('');

  // Money & time calculations
  const daysElapsedFraction = elapsed.totalSeconds / 86400;
  const moneySaved = Math.round(daysElapsedFraction * (currentHabit?.costPerDay || 0));
  const timeSavedHours = Math.round((daysElapsedFraction * (currentHabit?.timeSavedMinutesPerDay || 0)) / 60 * 10) / 10;

  // Handle Relapse Confirm
  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHabit) return;
    resetHabitStreak(currentHabit.id, relapseReason, relapseTrigger);
    setIsResetModalOpen(false);
    setRelapseReason('');
    setRelapseTrigger('');
  };

  // Handle Create Habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    addHabit({
      name: newHabitName.trim(),
      nameBn: newHabitNameBn.trim() || newHabitName.trim(),
      iconName: 'Flame',
      category: 'personal',
      startDate: Date.now(),
      costPerDay: parseFloat(newHabitCost) || 0,
      timeSavedMinutesPerDay: parseFloat(newHabitTime) || 0,
      pledge: newHabitPledge.trim() || undefined,
      pledgeBn: newHabitPledge.trim() || undefined,
    });

    setIsAddHabitOpen(false);
    setNewHabitName('');
    setNewHabitNameBn('');
    setNewHabitPledge('');
    triggerStreakCelebration();
  };

  // Save Pledge
  const handleSavePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHabit) return;
    updateHabitPledge(currentHabit.id, pledgeInput);
    setIsEditingPledge(false);
  };

  // Current random motivational quote
  const quotesList = t.quotes;
  const quote = quotesList[elapsed.days % quotesList.length] || quotesList[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Habit Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Flame className="w-8 h-8 text-amber-500 animate-pulse" />
            <span>{t.habit.title}</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t.habit.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Active Habit Dropdown */}
          <div className="relative">
            <select
              value={activeHabitId}
              onChange={(e) => setActiveHabitId(e.target.value)}
              className="appearance-none bg-white border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm py-2 pl-3.5 pr-8 rounded-xl shadow-2xs focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
            >
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {language === 'bn' ? h.nameBn : h.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setIsAddHabitOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.habit.addCustomHabit}</span>
          </button>
        </div>
      </div>

      {/* Main LIVE STREAK CLOCK HERO CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'bn' ? currentHabit?.nameBn : currentHabit?.name}
            </span>
          </div>

          <h3 className="text-sm font-medium text-slate-300">
            {t.habit.liveStreak}
          </h3>

          {/* THE 4 FLIP CLOCK BOXES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 w-full max-w-2xl my-6">
            {/* Days */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {formatPlainNumber(elapsed.days, language)}
              </span>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-widest mt-1">
                {t.habit.days}
              </span>
            </div>

            {/* Hours */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {formatPlainNumber(String(elapsed.hours).padStart(2, '0'), language)}
              </span>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-widest mt-1">
                {t.habit.hours}
              </span>
            </div>

            {/* Minutes */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {formatPlainNumber(String(elapsed.minutes).padStart(2, '0'), language)}
              </span>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-widest mt-1">
                {t.habit.mins}
              </span>
            </div>

            {/* Seconds (Pulsing / Glowing) */}
            <div className="bg-slate-900/90 border-2 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-xl shadow-amber-500/10 backdrop-blur-md flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-6xl font-black text-amber-400 font-mono tracking-tight animate-pulse">
                {formatPlainNumber(String(elapsed.seconds).padStart(2, '0'), language)}
              </span>
              <span className="text-xs uppercase font-bold text-amber-300 tracking-widest mt-1">
                {t.habit.secs}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {t.habit.sinceStarted}:{' '}
            <span className="text-slate-200 font-medium">
              {new Date(currentHabit?.startDate || Date.now()).toLocaleDateString(
                language === 'bn' ? 'bn-BD' : 'en-US',
                { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
              )}
            </span>
          </p>

          {/* Reset button */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-rose-500/20 text-rose-200 hover:text-white border border-rose-500/30 text-xs sm:text-sm font-bold transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.habit.btnReset}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Reclaimed: Money Saved & Hours Saved */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Money Saved */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              {t.habit.moneySaved}
            </span>
            <span className="text-3xl font-black text-emerald-700 mt-1 block">
              {formatCurrency(moneySaved, currency, language)}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {language === 'bn'
                ? `দৈনিক আনুমানিক ${formatCurrency(currentHabit?.costPerDay || 0, currency, language)} হিসেবে সংরক্ষিত`
                : `Based on saving ~${formatCurrency(currentHabit?.costPerDay || 0, currency, language)} / day`}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        {/* Time Reclaimed */}
        <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
              {t.habit.timeSaved}
            </span>
            <span className="text-3xl font-black text-indigo-700 mt-1 block">
              {formatPlainNumber(timeSavedHours, language)} {t.habit.hours}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {language === 'bn'
                ? `দৈনিক ${currentHabit?.timeSavedMinutesPerDay || 0} মিনিট সময় জীবনে ফিরিয়ে এনেছেন`
                : `Reclaimed ~${currentHabit?.timeSavedMinutesPerDay || 0} minutes of daily life`}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Milestone Badges Achievements */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="font-extrabold text-slate-900 text-base">
              {t.habit.milestones}
            </h4>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {MILESTONES.filter((m) => elapsed.days >= m.days).length} / {MILESTONES.length} {t.habit.milestoneUnlocked}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MILESTONES.map((m) => {
            const isUnlocked = elapsed.days >= m.days;
            return (
              <div
                key={m.days}
                onClick={() => {
                  if (isUnlocked) triggerConfetti();
                }}
                className={`p-4 rounded-2xl border transition-all text-center ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950 shadow-xs cursor-pointer hover:scale-102'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div className="text-lg font-bold mb-1">{m.badge.split(' ')[0]}</div>
                <div className="text-xs font-bold">
                  {language === 'bn' ? m.labelBn : m.labelEn}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${
                    isUnlocked
                      ? 'bg-amber-200 text-amber-900 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isUnlocked ? t.habit.milestoneUnlocked : `${m.days - elapsed.days}d left`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Pledge & Motivational Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Pledge */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h4 className="font-extrabold text-slate-900 text-base">
                  {t.habit.dailyPledge}
                </h4>
              </div>
              <button
                onClick={() => {
                  setPledgeInput(currentHabit?.pledge || '');
                  setIsEditingPledge(true);
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                {language === 'bn' ? 'সম্পাদনা' : 'Edit Pledge'}
              </button>
            </div>

            <blockquote className="italic text-slate-700 text-sm p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              "{language === 'bn' ? currentHabit?.pledgeBn || currentHabit?.pledge : currentHabit?.pledge}"
            </blockquote>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {language === 'bn'
              ? 'প্রতিদিন সকালে আপনার প্রতিজ্ঞাটি মনে করিয়ে দিন।'
              : 'Read your personal oath aloud every morning.'}
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-5 h-5 text-indigo-600" />
              <h4 className="font-extrabold text-slate-900 text-base">
                {t.habit.quotesTitle}
              </h4>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <p className="text-slate-800 text-sm font-medium">"{quote.text}"</p>
              <span className="block text-right text-xs font-bold text-indigo-700 mt-2">
                — {quote.author}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {language === 'bn'
              ? 'মনের জোর বাড়াতে নিয়মিত প্রেরণা নিন।'
              : 'Wisdom to reinforce your resolve throughout the journey.'}
          </div>
        </div>
      </div>

      {/* Relapse & Recovery History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h4 className="font-extrabold text-slate-900 text-base">
          {t.habit.relapseHistory}
        </h4>

        {(!currentHabit?.relapseHistory || currentHabit.relapseHistory.length === 0) ? (
          <div className="py-6 text-center text-slate-400 text-xs sm:text-sm">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p>{t.habit.noRelapses}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentHabit.relapseHistory.map((entry) => {
              const prevDays = Math.round(entry.previousDurationMs / 86400000);
              return (
                <div key={entry.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">
                      {new Date(entry.timestamp).toLocaleDateString(
                        language === 'bn' ? 'bn-BD' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                    {entry.reason && (
                      <p className="text-slate-600 mt-0.5">
                        {language === 'bn' ? 'কারণ:' : 'Reason:'} {entry.reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                      {t.habit.previousStreak}: {formatPlainNumber(prevDays, language)} {t.habit.days}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RELAPSE CONFIRMATION MODAL */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <RotateCcw className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-center text-slate-900">
                {t.habit.resetTitle}
              </h3>
              <p className="text-xs text-center text-slate-500 mt-1 mb-5">
                {t.habit.resetDesc}
              </p>

              <form onSubmit={handleConfirmReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.habit.relapseReason}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t.habit.relapseReasonPlaceholder}
                    value={relapseReason}
                    onChange={(e) => setRelapseReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {t.habit.cancel}
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
                  >
                    {t.habit.confirmReset}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD CUSTOM HABIT MODAL */}
      <AnimatePresence>
        {isAddHabitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {t.habit.addCustomHabit}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {language === 'bn'
                  ? 'যেকোনো ক্ষতিকর বা অস্বাস্থ্যকর অভ্যাস ট্র্যাক করতে নতুন স্ট্রিক শুরু করুন।'
                  : 'Start a new abstinence streak for any habit you want to quit.'}
              </p>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Habit Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. No Vaping / No Junk Food"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    অভ্যাসের নাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: অতিরিক্ত ক্যাফেইন বর্জন"
                    value={newHabitNameBn}
                    onChange={(e) => setNewHabitNameBn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Est. Cost / Day
                    </label>
                    <input
                      type="number"
                      value={newHabitCost}
                      onChange={(e) => setNewHabitCost(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Minutes Saved / Day
                    </label>
                    <input
                      type="number"
                      value={newHabitTime}
                      onChange={(e) => setNewHabitTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t.habit.dailyPledge}
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. I am choosing health and focus."
                    value={newHabitPledge}
                    onChange={(e) => setNewHabitPledge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddHabitOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {t.modals.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
                  >
                    {t.habit.addCustomHabit}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PLEDGE MODAL */}
      <AnimatePresence>
        {isEditingPledge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.habit.dailyPledge}
              </h3>
              <form onSubmit={handleSavePledge} className="space-y-4">
                <textarea
                  rows={3}
                  required
                  value={pledgeInput}
                  onChange={(e) => setPledgeInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPledge(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {t.modals.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    {t.habit.savePledge}
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
