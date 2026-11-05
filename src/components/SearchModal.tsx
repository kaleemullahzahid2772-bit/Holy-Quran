import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  BookOpen,
  Compass,
  ArrowRight,
  Sparkles,
  BarChart2,
  FileText,
  CheckCircle,
  Hash,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Info
} from 'lucide-react';
import {
  searchQuran,
  searchArabicLetter,
  normalizeArabicText,
  QuranSearchResult,
  LetterSearchResult
} from '../services/quranSearchService';
import { QURAN_LETTERS_STATISTICS } from '../data/quranStatisticsData';
import { WordOccurrenceInstance } from '../types/quran';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageNumber: number) => void;
}

type SearchCategory = 'all' | 'letters' | 'words' | 'surahs' | 'juz';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<QuranSearchResult | null>(null);
  
  // Selected word modal/drawer inside search
  const [selectedWordData, setSelectedWordData] = useState<{
    cleanWord: string;
    sampleText: string;
    totalCount: number;
    occurrences: WordOccurrenceInstance[];
  } | null>(null);

  // Quick letter occurrences modal/drawer
  const [selectedLetterStat, setSelectedLetterStat] = useState<LetterSearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setSearchResult(null);
      setSelectedWordData(null);
      setSelectedLetterStat(null);
    }
  }, [isOpen]);

  // Debounced Live Search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResult(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchQuran(query);
        setSearchResult(res);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle letter click from quick virtual letter buttons
  const handleQuickLetterClick = async (letter: string) => {
    setQuery(letter);
    setIsSearching(true);
    try {
      const res = await searchQuran(letter);
      setSearchResult(res);
      if (res.letterResult) {
        setSelectedLetterStat(res.letterResult);
      }
    } catch (e) {
      console.error('Quick letter search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Jump to specific occurrence and close
  const handleJump = (page: number) => {
    onSelectPage(page);
    onClose();
  };

  if (!isOpen) return null;

  // Filter items based on active category
  const hasSurahs = (searchResult?.matchedSurahs.length || 0) > 0;
  const hasJuz = (searchResult?.matchedJuz.length || 0) > 0;
  const hasWords = (searchResult?.matchedWords.length || 0) > 0;
  const hasLetter = !!searchResult?.letterResult;
  const hasPageJump = !!searchResult?.pageJump;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-white dark:bg-gray-900 border border-emerald-300 dark:border-emerald-800 rounded-3xl max-w-2xl w-full h-[90vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden transition-all">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-gold-300 border border-emerald-500/30">
              <Search size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-sans">
                قرآنی سرچ (Quran Search)
              </h3>
              <p className="text-[11px] text-emerald-200/90 font-sans">
                سورتیں، پارے، الفاظ، حروف اور ان کے کل مقامات تلاش کریں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="بند کریں"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="عربی حرف (مثلاً ث، ق)، کوئی لفظ (مثلاً رحمن، هدى)، سورۃ کا نام یا صفحہ نمبر..."
              className="w-full pl-10 pr-11 py-3 text-sm md:text-base bg-white dark:bg-gray-900 border border-emerald-300/80 dark:border-emerald-700/70 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-right font-sans"
              dir="rtl"
            />
            <div className="absolute right-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none">
              <Search size={20} />
            </div>
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchResult(null);
                  setSelectedWordData(null);
                  setSelectedLetterStat(null);
                }}
                className="absolute left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Arabic Letter Keyboard / Picker Chips */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5 px-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
              <span>حروفِ تہجی پر کلک کر کے فوری تلاش کریں:</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">کل ۲۹ حروف</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {QURAN_LETTERS_STATISTICS.slice(0, 16).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickLetterClick(item.letter)}
                  className={`px-2.5 py-1 rounded-lg border font-quran text-sm shrink-0 transition-all cursor-pointer ${
                    query === item.letter
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold scale-105'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                  title={`${item.nameUrdu} (${item.formattedCount})`}
                >
                  {item.letter}
                </button>
              ))}
              {QURAN_LETTERS_STATISTICS.slice(16).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickLetterClick(item.letter)}
                  className={`px-2.5 py-1 rounded-lg border font-quran text-sm shrink-0 transition-all cursor-pointer ${
                    query === item.letter
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold scale-105'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                  title={`${item.nameUrdu} (${item.formattedCount})`}
                >
                  {item.letter}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills (When search query exists) */}
          {query.trim() && (
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                تمام نتائج
              </button>
              {hasLetter && (
                <button
                  onClick={() => setActiveCategory('letters')}
                  className={`px-3 py-1 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                    activeCategory === 'letters'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  حرف کی شماریات
                </button>
              )}
              {hasWords && (
                <button
                  onClick={() => setActiveCategory('words')}
                  className={`px-3 py-1 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                    activeCategory === 'words'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  الفاظ ({searchResult?.matchedWords.length})
                </button>
              )}
              {hasSurahs && (
                <button
                  onClick={() => setActiveCategory('surahs')}
                  className={`px-3 py-1 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                    activeCategory === 'surahs'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  سورتیں ({searchResult?.matchedSurahs.length})
                </button>
              )}
              {hasJuz && (
                <button
                  onClick={() => setActiveCategory('juz')}
                  className={`px-3 py-1 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                    activeCategory === 'juz'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-200/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  پارے ({searchResult?.matchedJuz.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 1. Loading State */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">قرآنِ مجید میں تلاش کیا جا رہا ہے...</p>
            </div>
          )}

          {/* 2. Empty Query State (Initial Guide) */}
          {!query.trim() && !isSearching && (
            <div className="py-8 px-4 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <Sparkles size={32} />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  قرآنِ مجید میں کچھ بھی تلاش کریں
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  کوئی بھی حرف لکھیں یا اوپر موجود تختی سے منتخب کریں، لفظ یا آیت کا حصہ لکھیں، سورت کا نام، پارہ یا صفحہ نمبر درج کریں۔
                </p>
              </div>

              {/* Sample Popular Queries */}
              <div className="max-w-lg mx-auto bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200/70 dark:border-gray-700 text-right">
                <div className="text-xs font-bold text-emerald-800 dark:text-gold-300 mb-2.5">
                  تجویز کردہ تلاش (Popular Searches):
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {['ق', 'ث', 'الله', 'الرحمن', 'يس', 'البقرة', '125', 'سورة الكهف'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 text-xs text-gray-700 dark:text-gray-200 font-medium transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Direct Page Jump Card (If numeric) */}
          {!isSearching && hasPageJump && (activeCategory === 'all' || activeCategory === 'words') && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/40 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                  براہِ راست صفحہ پر جائیں
                </span>
                <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                  صفحہ نمبر {searchResult?.pageJump}
                </h4>
              </div>
              <button
                onClick={() => handleJump(searchResult!.pageJump!)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <span>کھولیں</span>
                <ArrowRight size={14} className="rotate-180" />
              </button>
            </div>
          )}

          {/* 4. Single Letter Occurrences Card (Requested by User) */}
          {!isSearching && hasLetter && (activeCategory === 'all' || activeCategory === 'letters') && searchResult?.letterResult && (
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/60 dark:via-gray-800 dark:to-gray-900 p-5 rounded-2xl border-2 border-emerald-400 dark:border-emerald-700 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-quran text-3xl font-bold shadow-md border border-gold-400/50">
                    {searchResult.letterResult.letter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {searchResult.letterResult.nameUrdu} ({searchResult.letterResult.nameArabic})
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                        قرآنی حرف
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      قرآنِ مجید میں اس حرف کے کل استعمالات اور الفاظ
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">قرآن میں کل بار:</div>
                  <div className="text-2xl font-black text-emerald-800 dark:text-gold-300">
                    {searchResult.letterResult.relation} {searchResult.letterResult.formattedCount}
                  </div>
                  {searchResult.letterResult.percentage && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400">
                      کل حروف کا {searchResult.letterResult.percentage}
                    </div>
                  )}
                </div>
              </div>

              {/* Letter statistics overview pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 pt-1">
                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-emerald-100 dark:border-emerald-900 text-right">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">مشتمل کلمات (Words):</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {searchResult.letterResult.wordsWithLetterCount.toLocaleString()} الفاظ
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-emerald-100 dark:border-emerald-900 text-right">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">کلمات میں کل تکرار:</div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {searchResult.letterResult.totalOccurrencesInWords.toLocaleString()} مرتبہ
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-white dark:bg-gray-800/80 border border-emerald-100 dark:border-emerald-900 text-right">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">نمایاں الفاظ:</div>
                  <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                    {searchResult.letterResult.topWords.length > 0 ? searchResult.letterResult.topWords[0].cleanWord : '-'}
                  </div>
                </div>
              </div>

              {/* Top Words Containing this Letter */}
              <div className="mt-4 pt-2">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center justify-between">
                  <span>وہ الفاظ جن میں حرف "{searchResult.letterResult.letter}" آیا ہے (کلک کر کے ہر مقام دیکھیں):</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    {searchResult.letterResult.wordsWithLetterCount} الفاظ
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {searchResult.letterResult.topWords.slice(0, 30).map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedWordData({
                          cleanWord: w.cleanWord,
                          sampleText: w.sampleText,
                          totalCount: w.count,
                          occurrences: w.occurrences,
                        });
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:shadow-sm text-right flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        {w.count} بار
                      </span>
                      <span className="font-quran text-base text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-gold-300">
                        {w.sampleText || w.cleanWord}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Surahs Results */}
          {!isSearching && hasSurahs && (activeCategory === 'all' || activeCategory === 'surahs') && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Compass size={14} className="text-emerald-600" />
                <span>سورتیں ({searchResult?.matchedSurahs.length}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {searchResult?.matchedSurahs.map((surah) => (
                  <div
                    key={surah.number}
                    onClick={() => handleJump(surah.startPage)}
                    className="p-3 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group text-right"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight size={14} className="text-gray-400 group-hover:text-emerald-600 group-hover:-translate-x-0.5 transition-all rotate-180" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          صفحہ {surah.startPage}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {surah.totalAyahs} آیات • {surah.revelationType === 'Makki' ? 'مکی' : 'مدنی'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {surah.nameUrdu}
                        </div>
                        <div className="text-[11px] text-gray-400 font-sans">
                          {surah.nameEnglish}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-gold-300 font-quran font-bold flex items-center justify-center text-sm">
                        {surah.number}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Juz / Para Results */}
          {!isSearching && hasJuz && (activeCategory === 'all' || activeCategory === 'juz') && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Layers size={14} className="text-teal-600" />
                <span>پارے ({searchResult?.matchedJuz.length}):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {searchResult?.matchedJuz.map((juz) => (
                  <div
                    key={juz.number}
                    onClick={() => handleJump(juz.startPage)}
                    className="p-3 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group text-right"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight size={14} className="text-gray-400 group-hover:text-teal-600 rotate-180" />
                      <div>
                        <div className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                          صفحہ {juz.startPage} تا {juz.endPage}
                        </div>
                        <div className="text-[10px] text-gray-400 font-sans">
                          {juz.nameEnglish}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                          {juz.nameUrdu}
                        </div>
                        <div className="font-quran text-xs text-gray-500 dark:text-gray-300">
                          {juz.nameArabic}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center text-xs">
                        {juz.number}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Words Results (Occurrences & Locations) */}
          {!isSearching && hasWords && (activeCategory === 'all' || activeCategory === 'words') && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-emerald-600" />
                  <span>الفاظ و کلمات ({searchResult?.matchedWords.length}):</span>
                </div>
                <span className="text-[11px] text-gray-400">
                  کلک کر کے قرآن میں تمام صفحات و آیات دیکھیں
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {searchResult?.matchedWords.slice(0, 40).map((word, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedWordData(word)}
                    className="p-3 bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group text-right"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        {word.totalCount} بار
                      </span>
                      <ArrowRight size={14} className="text-gray-400 group-hover:text-emerald-600 rotate-180" />
                    </div>
                    <div className="text-right">
                      <div className="font-quran text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-gold-300">
                        {word.sampleText || word.cleanWord}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {word.occurrences.length > 0 ? `پہلا مقام: صفحہ ${word.occurrences[0].page}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {searchResult!.matchedWords.length > 40 && (
                <div className="text-center py-2 text-xs text-gray-500">
                  مزید الفاظ دیکھنے کے لیے سرچ کو مزید مخصوص کریں۔
                </div>
              )}
            </div>
          )}

          {/* 8. No Results Found */}
          {!isSearching && query.trim() && !hasLetter && !hasSurahs && !hasJuz && !hasWords && !hasPageJump && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                <Search size={24} />
              </div>
              <h4 className="text-base font-bold text-gray-700 dark:text-gray-300">
                کوئی نتیجہ نہیں ملا
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                برائے مہربانی املا چیک کریں یا اوپر دیے گئے حروف میں سے کسی حرف پر کلک کر کے دیکھیں۔
              </p>
            </div>
          )}

        </div>

        {/* Selected Word Occurrences Detailed Popup Modal */}
        {selectedWordData && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-30">
            <div className="bg-white dark:bg-gray-900 border border-emerald-400 dark:border-emerald-700 rounded-2xl max-w-lg w-full max-h-[85%] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-quran text-2xl font-bold text-gold-200">
                      {selectedWordData.sampleText || selectedWordData.cleanWord}
                    </span>
                    <span className="text-xs bg-emerald-700 px-2 py-0.5 rounded-full font-bold">
                      کل {selectedWordData.totalCount} بار
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-0.5">
                    قرآنِ مجید میں جہاں جہاں یہ لفظ آیا ہے:
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWordData(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-full bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Occurrences List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedWordData.occurrences.map((occ, i) => (
                  <div
                    key={i}
                    onClick={() => handleJump(occ.page)}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between cursor-pointer group text-right"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        صفحہ {occ.page}
                      </span>
                      <ArrowRight size={14} className="text-gray-400 group-hover:text-emerald-600 rotate-180" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900 dark:text-gray-100">
                        سورۃ {occ.surahName} (آیت {occ.ayah})
                      </div>
                      <div className="text-[10px] text-gray-400">
                        سطر {occ.line} • لفظ نمبر {occ.position}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                <button
                  onClick={() => setSelectedWordData(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
                >
                  واپس
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
