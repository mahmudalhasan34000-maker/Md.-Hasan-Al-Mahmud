import React from 'react';
import { useApp } from '../context/AppContext';
import { translations, CURRENCY_SYMBOLS } from '../i18n/translations';
import {
  Wallet,
  ArrowLeftRight,
  PieChart,
  CheckSquare,
  Flame,
  Settings,
  Plus,
  Globe,
  Coins,
} from 'lucide-react';
import { Currency } from '../types';

export const Navbar: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { language, setLanguage, currency, setCurrency, activeTab, setActiveTab, openQuickAdd } = useApp();
  const t = translations[language];

  interface NavItem {
    id: 'dashboard' | 'debts' | 'expenses' | 'notes' | 'habit';
    label: string;
    icon: React.ElementType;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Wallet },
    { id: 'debts', label: t.nav.debts, icon: ArrowLeftRight },
    { id: 'expenses', label: t.nav.expenses, icon: PieChart },
    { id: 'notes', label: t.nav.notes, icon: CheckSquare },
    { id: 'habit', label: t.nav.habit, icon: Flame, highlight: true },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t.app.title}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {language === 'bn' ? 'স্মার্ট খাতা' : 'Pro'}
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 line-clamp-1">
                {t.app.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs shadow-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? item.highlight
                          ? 'text-amber-500'
                          : 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.id === 'habit' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Language Switch Toggle */}
            <button
              onClick={toggleLanguage}
              title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all border border-slate-200/70 active:scale-95 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.app.bilingualToggle}</span>
            </button>

            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="appearance-none bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold py-1.5 pl-3 pr-7 rounded-xl border border-slate-200/70 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
              >
                {Object.entries(CURRENCY_SYMBOLS).map(([code, details]) => (
                  <option key={code} value={code}>
                    {details.symbol} {code}
                  </option>
                ))}
              </select>
              <Coins className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => openQuickAdd('expense')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm px-3.5 py-1.5 sm:py-2 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">{t.app.quickAdd}</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              title={t.app.settings}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200/60"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-200/60 bg-white px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center justify-between gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${
                  isActive
                    ? item.highlight
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              />
              <span className="truncate max-w-[70px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
