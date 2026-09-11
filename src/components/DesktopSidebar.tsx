import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Bookmark,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  BookOpen
} from 'lucide-react';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';
import { Bookmark as BookmarkType } from '../types/quran';

interface DesktopSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: number;
  onSelectPage: (page: number) => void;
  bookmarks: BookmarkType[];
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isOpen,
  onToggle,
  currentPage,
  onSelectPage,
  bookmarks,
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAHS_DATA.filter(
    (s) =>
      s.nameArabic.includes(searchQuery) ||
      s.nameUrdu.includes(searchQuery) ||
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.number).includes(searchQuery)
  );

  return (
    <>
      {/* Collapsed Sidebar Toggle Tab (fixed on right edge) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-emerald-800/90 hover:bg-emerald-700 text-white py-3 px-1.5 rounded-l-xl shadow-xl border-l border-t border-b border-gold-400/40 flex-col items-center gap-2 cursor-pointer transition-all hover:pl-2.5 active:scale-95"
          title="فہرست و نیویگیشن سائیڈ بار کھولیں"
        >
          <ChevronLeft size={16} className="text-gold-300" />
          <span className="text-[11px] font-bold tracking-widest [writing-mode:vertical-rl] font-quran py-1">
            فہرست سورتیں و پارے
          </span>
        </button>
      )}

      {/* Desktop Sidebar Panel */}
      <aside
        className={`hidden lg:flex fixed right-0 top-16 bottom-0 z-30 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-l border-gray-200 dark:border-gray-800 shadow-2xl flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-gold-200">
            <Compass size={18} />
            <h3 className="font-bold text-sm font-quran">فہرست قرآنِ کریم</h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            title="سائیڈ بار بند کریں"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 gap-1 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'surahs'
                ? 'bg-white dark:bg-emerald-900 text-emerald-800 dark:text-gold-200 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            سورتیں (۱۱۴)
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'juz'
                ? 'bg-white dark:bg-emerald-900 text-emerald-800 dark:text-gold-200 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            پارے (۳۰)
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-white dark:bg-emerald-900 text-emerald-800 dark:text-gold-200 shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            بک مارکس ({bookmarks.length})
          </button>
        </div>

        {/* Surah Search input */}
        {activeTab === 'surahs' && (
          <div className="p-2.5 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input
                type="text"
                placeholder="سورۃ تلاش کریں..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search size={14} className="absolute right-2.5 top-2 text-gray-400" />
            </div>
          </div>
        )}

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60 p-1">
          {/* Surahs List */}
          {activeTab === 'surahs' &&
            filteredSurahs.map((s) => {
              const isCurrent = currentPage >= s.startPage && currentPage <= s.endPage;
              return (
                <button
                  key={s.number}
                  onClick={() => onSelectPage(s.startPage)}
                  className={`w-full p-2.5 flex items-center justify-between text-right rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-r-4 border-emerald-600 dark:border-gold-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      ص {s.startPage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-bold text-sm font-quran text-gray-900 dark:text-gray-100">
                        {s.nameArabic}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {s.nameUrdu} • آیات {s.totalAyahs} • {s.revelationType === 'Madani' ? 'مدنی' : 'مکی'}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-[10px] font-bold text-emerald-800 dark:text-gold-300 font-sans">
                      {s.number}
                    </div>
                  </div>
                </button>
              );
            })}

          {/* Juz List */}
          {activeTab === 'juz' &&
            JUZ_DATA.map((j) => {
              const isCurrent = currentPage >= j.startPage && currentPage <= j.endPage;
              return (
                <button
                  key={j.number}
                  onClick={() => onSelectPage(j.startPage)}
                  className={`w-full p-2.5 flex items-center justify-between text-right rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-r-4 border-emerald-600 dark:border-gold-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="text-left">
                    <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      ص {j.startPage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-bold text-sm font-mushaf text-gray-900 dark:text-gray-100">
                        {j.nameArabic}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {j.nameUrdu}
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-[10px] font-bold text-emerald-800 dark:text-gold-300 font-sans">
                      {j.number}
                    </div>
                  </div>
                </button>
              );
            })}

          {/* Bookmarks List */}
          {activeTab === 'bookmarks' &&
            (bookmarks.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                کوئی بک مارک محفوظ نہیں
              </div>
            ) : (
              bookmarks.map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => onSelectPage(bm.pageNumber)}
                  className="w-full p-2.5 flex items-center justify-between text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gold-100 dark:bg-emerald-950 text-emerald-800 dark:text-gold-300">
                    صفحہ {bm.pageNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="font-bold text-xs text-gray-800 dark:text-gray-200">
                        {bm.surahName}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {bm.juzName}
                      </div>
                    </div>
                    <Bookmark size={14} className="text-rose-500 fill-current" />
                  </div>
                </button>
              ))
            ))}
        </div>
      </aside>
    </>
  );
};
