import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  BarChart2,
  Search,
  Hash,
  Layers,
  ArrowUpDown,
  BookOpen,
  Info
} from 'lucide-react';
import {
  QURAN_LETTERS_STATISTICS,
  QURAN_DIACRITICS_STATISTICS,
  QURAN_GENERAL_STATISTICS,
  QuranLetterStatistic
} from '../data/quranStatisticsData';

interface QuranStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuranStatsModal: React.FC<QuranStatsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'letters' | 'diacritics' | 'general'>('letters');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'count-desc'>('default');

  // Filtered & Sorted Letters (Default is Arabic alphabetical sequence ا, ب, ت, ث, ج...)
  const displayedLetters = useMemo(() => {
    let list = [...QURAN_LETTERS_STATISTICS];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (item) =>
          item.letter.includes(q) ||
          item.nameUrdu.includes(q) ||
          item.nameArabic.includes(q) ||
          item.formattedCount.includes(q)
      );
    }
    if (sortBy === 'count-desc') {
      list.sort((a, b) => b.count - a.count);
    }
    return list;
  }, [searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-gray-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header (RTL: Title on Right, Close Button on Left) */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-400/30">
              <BarChart2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <span>قرآنی شماریات و اعداد و شمار</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-emerald-100">
                  مکمل قرآن
                </span>
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-sans">
                حروف، اعراب و حرکات اور نقاط کی جامع مستند معلومات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="بند کریں"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grand Total Overview Strip (RTL Flow) */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/60 text-center shrink-0">
          <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/40 shadow-xs">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">
              قرآنی حروف شمار
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-sans">
              30 حروف
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/40 shadow-xs">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">
              کل حرکات (اعراب)
            </span>
            <span className="text-sm sm:text-base font-extrabold text-amber-700 dark:text-amber-300 font-sans">
              1,04,643
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/40 shadow-xs">
            <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-medium">
              کل نقاط (نقطے)
            </span>
            <span className="text-sm sm:text-base font-extrabold text-teal-700 dark:text-teal-300 font-sans">
              1,05,881
            </span>
          </div>
        </div>

        {/* Tab Navigation (RTL Order) */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/60 p-1.5 gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('letters')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'letters'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Hash size={14} />
            <span>حروف کی تعداد ({QURAN_LETTERS_STATISTICS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diacritics')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'diacritics'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Layers size={14} />
            <span>حرکات، اعراب و نقاط ({QURAN_DIACRITICS_STATISTICS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <BookOpen size={14} />
            <span>عمومی حقائق (Overview)</span>
          </button>
        </div>

        {/* Tab 1: Letters (حروف کی تعداد - دائیں سے بائیں Right-to-Left RTL Grid) */}
        {activeTab === 'letters' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3">
            {/* Search & Sort Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute right-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="حرف یا نام سے تلاش کریں (مثلاً: الف، ب، ع)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right font-sans"
                />
              </div>

              <button
                onClick={() => setSortBy(sortBy === 'default' ? 'count-desc' : 'default')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                  sortBy === 'count-desc'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                title="تکرار کے مطابق ترتیب دیں"
              >
                <ArrowUpDown size={13} />
                <span>{sortBy === 'count-desc' ? 'زیادہ تکرار' : 'ترتیبِ حروف (ا، ب، ت)'}</span>
              </button>
            </div>

            {/* Arabic Letters RTL Grid: Flows from Right to Left: ا، ب، ت، ث، ج، ح... */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" dir="rtl">
              {displayedLetters.map((item: QuranLetterStatistic) => (
                <div
                  key={item.id}
                  className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all flex items-center justify-between gap-2"
                >
                  {/* Right side: Letter Glyph + Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/70 dark:to-teal-900/50 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center shrink-0 shadow-xs">
                      <span className="text-2xl font-bold font-mushaf text-emerald-950 dark:text-gold-200 leading-none">
                        {item.letter}
                      </span>
                    </div>

                    <div className="text-right truncate">
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                        {item.nameUrdu}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mushaf">
                        ({item.nameArabic})
                      </div>
                    </div>
                  </div>

                  {/* Left side: Count with ~ or > relation symbol */}
                  <div className="text-left font-sans flex items-baseline gap-1 shrink-0" dir="ltr">
                    <span className="text-xs font-bold text-gray-400">
                      {item.relation}
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 tracking-tight">
                      {item.formattedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {displayedLetters.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400">
                کوئی حرف نہیں ملا
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Diacritics, Marks & Dots (کل حرکات و اعراب - RTL Grid) */}
        {activeTab === 'diacritics' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
              <Info size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                قرآن مجید کے اندر تمام اعراب، حرکات اور نقطوں کا مکمل اور تفصیلی احصاء:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
              {QURAN_DIACRITICS_STATISTICS.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                        <span className="text-2xl font-bold font-mushaf text-emerald-900 dark:text-gold-300">
                          {item.sample}
                        </span>
                      </div>

                      <div className="text-right">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {item.nameUrdu}
                        </h4>
                        <span className="text-[11px] text-gray-400 font-mushaf">
                          {item.nameArabic}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.description}
                    </span>
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-sans tracking-wide">
                      {item.formattedCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: General Quranic Overview (عمومی قرآنی حقائق - RTL Grid) */}
        {activeTab === 'general' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" dir="rtl">
              {QURAN_GENERAL_STATISTICS.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                >
                  <div className="text-right">
                    <span className="font-bold text-sm text-gray-800 dark:text-gray-200 block">
                      {stat.labelUrdu}
                    </span>
                    <span className="text-[11px] text-gray-400 font-sans">
                      {stat.labelEng}
                    </span>
                  </div>

                  <div className="text-left flex flex-col items-end">
                    <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-sans">
                      {stat.value}
                    </span>
                    {stat.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 mt-0.5">
                        {stat.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-98"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
