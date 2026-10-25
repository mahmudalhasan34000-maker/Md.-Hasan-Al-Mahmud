/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DebtTracker } from './components/DebtTracker';
import { ExpenseTracker } from './components/ExpenseTracker';
import { ShoppingAndNotes } from './components/ShoppingAndNotes';
import { HabitTracker } from './components/HabitTracker';
import { QuickAddModal } from './components/QuickAddModal';
import { SettingsModal } from './components/SettingsModal';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MainLayout: React.FC = () => {
  const { activeTab, openQuickAdd } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'debts' && <DebtTracker />}
            {activeTab === 'expenses' && <ExpenseTracker />}
            {activeTab === 'notes' && <ShoppingAndNotes />}
            {activeTab === 'habit' && <HabitTracker />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Action Button (FAB) on mobile for instant thumb access */}
      <div className="fixed bottom-5 right-5 z-30 md:hidden">
        <button
          onClick={() => openQuickAdd('expense')}
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Quick Add"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Global Modals */}
      <QuickAddModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
