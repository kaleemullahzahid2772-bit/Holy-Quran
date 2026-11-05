import React, { useState } from 'react';
import { X, Search, BookOpen, Layers, Hash, ArrowRight, Palette, Compass } from 'lucide-react';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';
import { THEMATIC_SUBJECTS_LIST, THEMATIC_PASSAGES } from '../data/quranThematicData';
import { ThematicSubjectId } from '../types/quran';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
  initialTab?: 'surahs' | 'juz' | 'pages' | 'themes';
  currentPage: number;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  initialTab = 'surahs',
  currentPage,
}) => {
  const [activeTab, setActiveTab] = useState<'surahs' | 'juz' | 'pages' | 'themes'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetPageInput, setTargetPageInput] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<ThematicSubjectId | 'all'>('all');

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
    if (!isNaN(page) && page >= 1 && page <= 604) {
      onSelectPage(page);
      onClose();
    }
  };

  // Filtered Passages by selected theme
  const filteredPassages = THEMATIC_PASSAGES.filter(p => {
    if (selectedThemeId === 'all') return true;
    return p.subjectId === selectedThemeId;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <BookOpen size={20} />
            <h3 className="font-bold text-base">قرآن مجید کی فہرست و تلاش</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Tabs: Surahs, Juz, Pages, Themes */}
        <div className="flex p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 gap-1 text-[11px] sm:text-xs">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'surahs'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            سورتیں
          </button>
          <button
            onClick={() => setActiveTab('juz')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'juz'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            پارے (Juz)
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'themes'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            موضوعات (Themes)
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'pages'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            صفحہ نمبر
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
                      <div className="text-[10px] text-gray-400">
                        {surah.revelationType === 'Makki' ? 'مکی' : 'مدنی'} • {surah.totalAyahs} آیات
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mushaf font-bold text-base text-emerald-900 dark:text-gold-300">
                      {surah.nameArabic}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      صفحہ {surah.startPage}
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
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors ${
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
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {juz.nameUrdu}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Themes (الموضوعات - Thematic Classification) */}
        {activeTab === 'themes' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Thematic Category Chips */}
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex gap-1.5 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setSelectedThemeId('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                  selectedThemeId === 'all'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                تمام موضوعات
              </button>
              {THEMATIC_SUBJECTS_LIST.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedThemeId(theme.id)}
                  style={{
                    backgroundColor: selectedThemeId === theme.id ? theme.badgeBg : undefined,
                    color: selectedThemeId === theme.id ? '#ffffff' : undefined
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedThemeId === theme.id
                      ? 'shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {theme.nameUrdu.split('،')[0]}
                </button>
              ))}
            </div>

            {/* Passages List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2 space-y-1.5">
              {filteredPassages.map((p, idx) => {
                const surah = SURAHS_DATA.find(s => s.number === p.surah);
                const themeMeta = THEMATIC_SUBJECTS_LIST.find(t => t.id === p.subjectId);
                const targetPage = surah ? surah.startPage : 1;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectPage(targetPage);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-2xl border border-gray-200/60 dark:border-gray-800 hover:border-emerald-500/50 bg-white dark:bg-gray-850 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all text-right flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: themeMeta?.badgeBg }}
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                      />
                      <span className="text-[11px] font-sans font-bold text-gray-400 dark:text-gray-500">
                        صفحہ {targetPage}
                      </span>
                    </div>

                    <div className="text-right flex-1 pr-1">
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mushaf">
                        {p.titleArabic}
                      </div>
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-sans mt-0.5">
                        {p.titleUrdu}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5 font-sans">
                        {surah ? surah.nameArabic : ''} • الآيات {p.fromAyah} تا {p.toAyah}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Direct Page Jump (1 to 604) */}
        {activeTab === 'pages' && (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Hash size={32} />
            </div>

            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">براہِ راست صفحہ پر جائیں</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              مصحف التفصيل الموضوعي کے ۱ سے ۶۰۴ تک کسی بھی صفحہ نمبر پر جائیں۔
            </p>

            <form onSubmit={handlePageJump} className="w-full max-w-xs mt-6 space-y-4">
              <div className="relative">
                <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min={1}
                  max={604}
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
              {[1, 2, 22, 50, 77, 106, 282, 397, 582, 604].map((quickPage) => (
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
