import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations, CURRENCY_SYMBOLS } from '../i18n/translations';
import { Currency, Language } from '../types';
import {
  X,
  Globe,
  Coins,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    exportDataJson,
    importDataJson,
    loadSampleDemoData,
    clearAllData,
  } = useApp();

  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          alert(language === 'bn' ? 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!' : 'Backup restored successfully!');
          onClose();
        } else {
          alert(language === 'bn' ? 'ফাইলটি অকার্যকর।' : 'Invalid backup file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">{t.settings.title}</h3>
            <p className="text-xs text-slate-500">{t.settings.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{t.settings.language}</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between ${
                  language === 'bn'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>বাংলা (Bengali)</span>
                {language === 'bn' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-3 px-4 rounded-2xl border font-bold text-sm transition-all flex items-center justify-between ${
                  language === 'en'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English</span>
                {language === 'en' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{t.settings.currency}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(CURRENCY_SYMBOLS).map(([currKey, info]) => (
                <button
                  key={currKey}
                  type="button"
                  onClick={() => setCurrency(currKey as Currency)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    currency === currKey
                      ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>
                    {info.symbol} {currKey}
                  </span>
                  {currency === currKey && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.settings.dataManagement}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export */}
              <button
                type="button"
                onClick={exportDataJson}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    {t.settings.exportJson}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {t.settings.exportDesc}
                  </span>
                </div>
              </button>

              {/* Import */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">
                    {t.settings.importJson}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {t.settings.importDesc}
                  </span>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Load Demo Data & Reset */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  loadSampleDemoData();
                  onClose();
                }}
                className="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 transition-colors flex items-center gap-3 text-left"
              >
                <RefreshCw className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="block text-xs font-bold">
                    {t.settings.loadDemo}
                  </span>
                  <span className="block text-[11px] text-emerald-700/80">
                    {t.settings.loadDemoDesc}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.settings.clearAllConfirm)) {
                    clearAllData();
                    onClose();
                  }
                }}
                className="w-full p-3 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-900 transition-colors flex items-center gap-3 text-left"
              >
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="block text-xs font-bold">{t.settings.clearAll}</span>
                  <span className="block text-[11px] text-rose-700/80">
                    {t.settings.clearAllDesc}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {t.settings.privacyNotice}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
