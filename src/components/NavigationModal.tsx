import React, { useState } from 'react';
import { X, Search, Compass, BookOpen, Hash, ArrowRight } from 'lucide-react';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageNumber: number) => void;
  initialTab?: 'surahs' | 'juz' | 'pages';
  currentPage: number;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  initialTab = 'surahs',
  currentPage,
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'pages'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetPageInput, setTargetPageInput] = useState('');

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

  // Handle direct page jump
  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(targetPageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= 559) {
      onSelectPage(page);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl max-w-md w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-gold-300" />
            <h3 className="font-bold text-base">قرآنی نیویگیشن (Navigation)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'surahs'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            سورتیں (Surahs)
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'juz'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            پارے (Paras / Juz)
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pages'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            صفحہ نمبر (Page)
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
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => {
                    onSelectPage(surah.startPage);
                    onClose();
                  }}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors text-right ${
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
                      <div className="text-[11px] text-gray-400">
                        {surah.revelationType === 'Makki' ? 'مکی' : 'مدنی'} • {surah.totalAyahs} آیات
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-quran text-gray-900 dark:text-gray-100">
                      {surah.nameArabic}
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-sans">
                      صفحہ {surah.startPage}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Juz List */}
        {activeTab === 'juz' && (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {JUZ_DATA.map((juz) => (
              <button
                key={juz.number}
                onClick={() => {
                  onSelectPage(juz.startPage);
                  onClose();
                }}
                className={`w-full px-4 py-3.5 flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors text-right ${
                  currentPage >= juz.startPage && currentPage <= juz.endPage
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-r-4 border-emerald-600'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 flex items-center justify-center text-xs font-bold font-sans">
                    {juz.number}
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {juz.nameEnglish}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      پارہ {juz.number}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold font-quran text-gray-900 dark:text-gray-100">
                    {juz.nameArabic}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-sans">
                    صفحہ {juz.startPage}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Direct Page Number Jump */}
        {activeTab === 'pages' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-3xl mb-4">
              <BookOpen size={36} />
            </div>

            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">براہِ راست صفحہ پر جائیں</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              مصحف کے ۱ سے ۵۵۹ تک کسی بھی صفحہ نمبر پر جائیں۔ (اصل قرآنی متن صفحہ ۲ تا ۵۴۹ ہے)۔
            </p>

            <form onSubmit={handlePageJump} className="w-full max-w-xs mt-6 space-y-4">
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={559}
                  placeholder="مثلاً: 25"
                  value={targetPageInput}
                  onChange={(e) => setTargetPageInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 text-center text-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl border-2 border-transparent focus:border-emerald-500 outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>صفحہ کھولیں</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-xs">
              {[2, 3, 21, 46, 75, 147, 255, 397, 529, 548].map((quickPage) => (
                <button
                  key={quickPage}
                  onClick={() => {
                    onSelectPage(quickPage);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  صفحہ {quickPage}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
