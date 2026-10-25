import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations, formatCurrency } from '../i18n/translations';
import { ShoppingItem, NoteItem } from '../types';
import {
  ShoppingBag,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Pin,
  Search,
  ArrowRight,
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ShoppingAndNotes: React.FC = () => {
  const {
    language,
    currency,
    shoppingList,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    clearCompletedShopping,
    convertShoppingToExpense,
    notes,
    addNote,
    deleteNote,
    togglePinNote,
    openQuickAdd,
  } = useApp();

  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'shopping' | 'notes'>('shopping');

  // Shopping form inline
  const [showAddShopping, setShowAddShopping] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemEstCost, setItemEstCost] = useState('');
  const [itemCategory, setItemCategory] = useState('Groceries');
  const [itemPriority, setItemPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Notes state
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('emerald');
  const [noteTags, setNoteTags] = useState('');
  const [searchNotesQuery, setSearchNotesQuery] = useState('');

  // Shopping calculations
  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter((i) => i.completed).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const totalEstimatedCost = shoppingList.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    addShoppingItem({
      name: itemName.trim(),
      quantity: itemQty.trim() || undefined,
      estimatedCost: itemEstCost ? parseFloat(itemEstCost) : undefined,
      category: itemCategory,
      completed: false,
      priority: itemPriority,
    });

    setItemName('');
    setItemQty('');
    setItemEstCost('');
    setShowAddShopping(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const tagsArray = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addNote({
      title: noteTitle.trim() || (language === 'bn' ? 'শিরোনামহীন নোট' : 'Untitled Note'),
      content: noteContent.trim(),
      color: noteColor,
      pinned: false,
      tags: tagsArray,
    });

    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setShowAddNote(false);
  };

  const filteredNotes = notes
    .filter((n) => {
      if (!searchNotesQuery.trim()) return true;
      const q = searchNotesQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((tg) => tg.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const NOTE_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.checklist.title}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {t.checklist.subtitle}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'shopping'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>{t.checklist.shoppingTab}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
              {totalItems - completedItems}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{t.checklist.notesTab}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-800">
              {notes.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'shopping' ? (
        /* SHOPPING CHECKLIST VIEW */
        <div className="space-y-5">
          {/* Progress Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {language === 'bn' ? 'বাজারের ফর্দ অগ্রগতি' : 'Bazaar Completion Rate'}
                </span>
                <h3 className="text-2xl font-black mt-1">
                  {t.checklist.itemsCompleted
                    .replace('{completed}', String(completedItems))
                    .replace('{total}', String(totalItems))
                    .replace('{percent}', String(progressPercent))}
                </h3>
                <p className="text-xs text-emerald-100 mt-1">
                  {language === 'bn' ? 'আনুমানিক মোট খরচ:' : 'Total Estimated Cost:'}{' '}
                  <strong>{formatCurrency(totalEstimatedCost, currency, language)}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddShopping(true)}
                  className="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{t.checklist.btnAddItem}</span>
                </button>
                {completedItems > 0 && (
                  <button
                    onClick={clearCompletedShopping}
                    className="bg-emerald-800/80 hover:bg-emerald-900 text-white px-3 py-2.5 rounded-xl font-semibold text-xs transition-colors"
                  >
                    {t.checklist.clearCompleted}
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-emerald-950/40 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Add Item Inline Panel */}
          <AnimatePresence>
            {showAddShopping && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm"
              >
                <form onSubmit={handleAddShoppingItem} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {t.checklist.itemName} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'bn' ? 'যেমন: চাল, তেল, কফি' : 'E.g. Coffee, Milk'}
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {t.checklist.quantity}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'bn' ? 'যেমন: ২ কেজি, ১ প্যাকেট' : 'E.g. 2 kg, 1 box'}
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {t.checklist.estimatedCost}
                      </label>
                      <input
                        type="number"
                        placeholder="৳ 0"
                        value={itemEstCost}
                        onChange={(e) => setItemEstCost(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        {t.checklist.priority}
                      </label>
                      <select
                        value={itemPriority}
                        onChange={(e) => setItemPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 bg-white"
                      >
                        <option value="low">{t.checklist.priorityLow}</option>
                        <option value="medium">{t.checklist.priorityMedium}</option>
                        <option value="high">{t.checklist.priorityHigh}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddShopping(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {t.modals.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    >
                      {t.checklist.btnAddItem}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shopping Items List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            {shoppingList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">{t.checklist.noItems}</p>
                <button
                  onClick={() => setShowAddShopping(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500"
                >
                  {t.checklist.btnAddItem}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {shoppingList.map((item) => {
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl transition-all ${
                        item.completed
                          ? 'bg-slate-50/70 opacity-75'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            item.completed
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4 stroke-[3]" />
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold transition-all ${
                                item.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.quantity && (
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {item.quantity}
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                item.priority === 'high'
                                  ? 'bg-rose-100 text-rose-800'
                                  : item.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.priority === 'high'
                                ? t.checklist.priorityHigh
                                : item.priority === 'medium'
                                ? t.checklist.priorityMedium
                                : t.checklist.priorityLow}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {item.estimatedCost && (
                          <span className="text-sm font-bold text-slate-700">
                            {formatCurrency(item.estimatedCost, currency, language)}
                          </span>
                        )}

                        {/* Convert to expense button */}
                        {!item.completed && (
                          <button
                            onClick={() => convertShoppingToExpense(item)}
                            title={t.checklist.convertToExpenseTooltip}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>{t.checklist.convertToExpense}</span>
                          </button>
                        )}

                        <button
                          onClick={() => deleteShoppingItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* PERSONAL NOTES VIEW */
        <div className="space-y-5">
          {/* Notes Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.checklist.searchNotes}
                value={searchNotesQuery}
                onChange={(e) => setSearchNotesQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <button
              onClick={() => setShowAddNote(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t.checklist.btnAddNote}</span>
            </button>
          </div>

          {/* Add Note Modal/Card */}
          <AnimatePresence>
            {showAddNote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm"
              >
                <form onSubmit={handleAddNote} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {t.checklist.noteTitle}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'bn' ? 'নোটের শিরোনাম...' : 'Note title...'}
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {t.checklist.noteContent}
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={language === 'bn' ? 'বিস্তারিত নোট লিখুন...' : 'Write notes, ideas, plans...'}
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Finance, Goals, Home"
                        value={noteTags}
                        onChange={(e) => setNoteTags(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Color Theme
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        {(['emerald', 'indigo', 'amber', 'rose', 'purple'] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNoteColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              NOTE_COLOR_MAP[c].bg
                            } ${
                              noteColor === c
                                ? 'border-slate-800 scale-110 shadow-xs'
                                : 'border-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNote(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      {t.modals.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {t.checklist.btnAddNote}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
              <Sparkles className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">{t.checklist.noNotes}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const colorConfig = NOTE_COLOR_MAP[note.color] || NOTE_COLOR_MAP.emerald;
                return (
                  <motion.div
                    key={note.id}
                    layout
                    className={`rounded-2xl p-5 border shadow-2xs relative flex flex-col justify-between ${colorConfig.bg} ${colorConfig.border}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 text-base line-clamp-1">
                          {note.title}
                        </h4>
                        <button
                          onClick={() => togglePinNote(note.id)}
                          className={`p-1 rounded-md transition-colors ${
                            note.pinned
                              ? 'text-amber-600 bg-amber-100'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                          title={note.pinned ? t.checklist.unpinNote : t.checklist.pinNote}
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 mt-2.5 whitespace-pre-line leading-relaxed">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-slate-700 border border-black/5"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
