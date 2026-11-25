import React, { useState } from 'react';
import { X, Search, BookOpen, Compass } from 'lucide-react';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
  initialTab?: 'surahs' | 'juz';
  currentPage: number;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  initialTab = 'surahs',
  currentPage,
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filtered Surahs
  const filteredSurahs = SURAHS_DATA.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.nameEnglish.toLowerCase().includes(q) ||
      s.nameArabic.includes(q) ||
      s.nameUrdu.includes(q) ||
      String(s.number).includes(q) ||
      String(s.startPage).includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none" dir="rtl">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              <Compass size={20} />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                فہرستِ قرآن مجید (سورتیں و پارے)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                براہِ راست کسی بھی سورت یا پارے کے آغاز پر جائیں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2 Clean Tabs: Surahs & Juz */}
        <div className="flex p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'surahs'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            سورتیں (۱۱۴)
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'juz'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            پارے (۳۰)
          </button>
        </div>

        {/* Tab 1: Surahs List */}
        {activeTab === 'surahs' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="سورت کا نام یا نمبر تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none placeholder-gray-400 font-sans"
                />
              </div>
            </div>

            {/* List of 114 Surahs */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    onSelectPage(surah.startPage);
                    onClose();
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors text-right cursor-pointer ${
                    currentPage >= surah.startPage && currentPage <= surah.endPage
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-r-4 border-emerald-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold font-sans">
                      {surah.number}
                    </span>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {surah.nameEnglish}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {surah.revelationType === 'Makki' ? 'مکی' : 'مدنی'} • {surah.totalAyahs} آیات
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mushaf font-bold text-base text-emerald-900 dark:text-gold-300">
                      سُورَةُ {surah.nameArabic}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-sans">
                      {surah.nameUrdu} • صفحہ {surah.startPage}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Juz (Paras) List */}
        {activeTab === 'juz' && (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {JUZ_DATA.map((juz) => (
              <button
                key={juz.number}
                onClick={() => {
                  onSelectPage(juz.startPage);
                  onClose();
                }}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer text-right ${
                  currentPage >= juz.startPage && currentPage <= juz.endPage
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-r-4 border-emerald-600'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-bold font-sans">
                    {juz.number}
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      پارہ {juz.number}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      صفحات {juz.startPage} تا {juz.endPage}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mushaf font-bold text-base text-emerald-900 dark:text-gold-300">
                    {juz.nameArabic}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-sans">
                    {juz.nameUrdu}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
