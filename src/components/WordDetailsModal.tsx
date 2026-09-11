import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  MapPin,
  Search,
  ExternalLink,
  Compass,
  Layers,
  ChevronRight,
  Filter,
  Languages
} from 'lucide-react';
import { QuranWordData, WordOccurrenceResult, WordOccurrenceInstance, WordTranslationResult } from '../types/quran';
import { QuranDataService } from '../database/quranDataService';
import { JUZ_DATA } from '../data/juzData';

interface WordDetailsModalProps {
  word: QuranWordData | null;
  onClose: () => void;
  onJumpToOccurrence?: (page: number) => void;
}

export const WordDetailsModal: React.FC<WordDetailsModalProps> = ({
  word,
  onClose,
  onJumpToOccurrence,
}) => {
  const [occurrencesResult, setOccurrencesResult] = useState<WordOccurrenceResult | null>(null);
  const [loadingOccurrences, setLoadingOccurrences] = useState<boolean>(true);
  const [translation, setTranslation] = useState<WordTranslationResult | null>(null);
  const [loadingTranslation, setLoadingTranslation] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'occurrences' | 'details'>('occurrences');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!word) {
      setOccurrencesResult(null);
      setTranslation(null);
      setSearchQuery('');
      return;
    }

    setLoadingOccurrences(true);
    setLoadingTranslation(true);
    setSearchQuery('');
    // Set active tab to occurrences so user immediately sees all places
    setActiveTab('occurrences');

    // Fetch occurrences across the whole Quran
    QuranDataService.getWordOccurrences(word.textClean)
      .then((res) => {
        setOccurrencesResult(res);
      })
      .catch((err) => {
        console.error('Error fetching occurrences:', err);
      })
      .finally(() => {
        setLoadingOccurrences(false);
      });

    // Fetch authentic Urdu & English translation for this word
    QuranDataService.getWordTranslation(word)
      .then((res) => {
        setTranslation(res);
      })
      .catch((err) => {
        console.error('Error fetching translation:', err);
      })
      .finally(() => {
        setLoadingTranslation(false);
      });
  }, [word]);

  // Helper to find Juz for any page
  const getJuzForPage = (pageNum: number) => {
    return JUZ_DATA.find((j) => pageNum >= j.startPage && pageNum <= j.endPage) || null;
  };

  const currentJuz = word?.page ? getJuzForPage(word.page) : null;
  const totalCount = occurrencesResult?.totalCount ?? 1;
  const rawOccurrences = occurrencesResult?.occurrences || [];

  // Summary counts across Surahs and Paras
  const { uniqueSurahs, uniqueParas, filteredOccurrences } = useMemo(() => {
    const surahSet = new Set<number>();
    const paraSet = new Set<number>();

    rawOccurrences.forEach((occ) => {
      surahSet.add(occ.surah);
      const juz = JUZ_DATA.find((j) => occ.page >= j.startPage && occ.page <= j.endPage);
      if (juz) paraSet.add(juz.number);
    });

    // Filter occurrences based on search query (by Surah name, Ayah, Para, or Page)
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? rawOccurrences.filter((occ) => {
          const juz = JUZ_DATA.find((j) => occ.page >= j.startPage && occ.page <= j.endPage);
          return (
            occ.surahName.includes(q) ||
            String(occ.surah).includes(q) ||
            String(occ.ayah).includes(q) ||
            String(occ.page).includes(q) ||
            (juz && (juz.nameUrdu.includes(q) || juz.nameArabic.includes(q) || String(juz.number).includes(q)))
          );
        })
      : rawOccurrences;

    return {
      uniqueSurahs: Array.from(surahSet),
      uniqueParas: Array.from(paraSet),
      filteredOccurrences: filtered,
    };
  }, [rawOccurrences, searchQuery]);

  if (!word) return null;
  const d = word.diacritics;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-t sm:border border-emerald-200 dark:border-emerald-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-gold-500" />
            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
              تفصیلِ کلمہ و قرآنی تکرار (Word Analytics)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected Word Hero Card */}
        <div className="px-5 py-3.5 bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-950/40 text-center border-b border-gray-100 dark:border-gray-800">
          {/* Big Arabic Word */}
          <div className="text-4xl sm:text-5xl font-bold font-mushaf text-emerald-950 dark:text-gold-200 tracking-wide my-1 py-0.5">
            {word.text}
          </div>

          {/* Clean Word & Total Count Highlight */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
              قرآن میں کل تکرار: {loadingOccurrences ? '...' : `${totalCount} مرتبہ`}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mushaf font-bold text-xs">
              بغیر اعراب: {word.textClean}
            </span>
          </div>

          {/* Current Location Badges */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] text-gray-600 dark:text-gray-300 mt-2.5 bg-white/70 dark:bg-gray-800/70 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">موجودہ مقام:</span>
            <span>{word.surahName}</span>
            <span>•</span>
            <span>آیت {word.ayah}</span>
            <span>•</span>
            <span>{currentJuz ? currentJuz.nameUrdu : ''}</span>
            <span>•</span>
            <span>صفحہ {word.page || '—'}</span>
            <span>•</span>
            <span>سطر {word.line || '—'}</span>
          </div>

          {/* Word Translation Card (Urdu & English) */}
          <div className="mt-3 p-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-emerald-100 dark:border-emerald-800/60 shadow-sm text-right">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Languages size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>لفظی ترجمہ و معنی (Word Translation)</span>
              </div>
              {translation?.transliteration && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400 italic font-serif" dir="ltr">
                  {translation.transliteration}
                </span>
              )}
            </div>

            {loadingTranslation ? (
              <div className="py-2 text-center text-xs text-gray-400 animate-pulse">
                ترجمہ حاصل کیا جا رہا ہے...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Urdu Translation */}
                <div className="flex items-center justify-between gap-2 bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-2 rounded-xl border border-emerald-100/80 dark:border-emerald-900/40">
                  <span className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-100 font-mushaf">
                    {translation?.urdu || '—'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold shrink-0">
                    اردو
                  </span>
                </div>

                {/* English Translation */}
                <div className="flex items-center justify-between gap-2 bg-sky-50/70 dark:bg-sky-950/30 px-3 py-2 rounded-xl border border-sky-100/80 dark:border-sky-900/40" dir="ltr">
                  <span className="px-2 py-0.5 rounded-md bg-sky-200/60 dark:bg-sky-800/60 text-sky-900 dark:text-sky-200 text-[10px] font-bold shrink-0">
                    English
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-sky-950 dark:text-sky-100 font-sans text-right">
                    {translation?.english || '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher: Occurrences (Locations) vs Diacritics/Tajweed */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-800/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('occurrences')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'occurrences'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <MapPin size={14} />
            <span>تمام قرآنی مقامات ({loadingOccurrences ? '...' : totalCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Layers size={14} />
            <span>اعراب و تجوید (Diacritics)</span>
          </button>
        </div>

        {/* Tab 1: All Quranic Locations (DEFAULT & PRIMARY) */}
        {activeTab === 'occurrences' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3">
            {/* Quick Distribution Overview */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">کل تکرار</span>
                <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300 font-sans">
                  {totalCount} بار
                </span>
              </div>
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">سورتوں کی تعداد</span>
                <span className="text-sm font-extrabold text-sky-800 dark:text-sky-300 font-sans">
                  {uniqueSurahs.length} سورتیں
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">پاروں کی تعداد</span>
                <span className="text-sm font-extrabold text-amber-800 dark:text-amber-300 font-sans">
                  {uniqueParas.length} پارے
                </span>
              </div>
            </div>

            {/* Search / Filter Input (if occurrences > 3) */}
            {rawOccurrences.length > 3 && (
              <div className="relative">
                <Search size={14} className="absolute right-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="سورت، پارہ، یا صفحہ نمبر سے فلٹر کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right font-sans"
                  dir="rtl"
                />
              </div>
            )}

            {/* List of All Occurrences */}
            <div className="space-y-2.5 flex-1">
              {loadingOccurrences ? (
                <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                  تمام قرآنی مقامات لوڈ ہو رہے ہیں...
                </div>
              ) : filteredOccurrences.length > 0 ? (
                filteredOccurrences.map((occ: WordOccurrenceInstance, idx: number) => {
                  const juz = getJuzForPage(occ.page);
                  const isCurrent = word.page === occ.page && word.line === occ.line;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-gold-50/80 dark:bg-gold-950/30 border-gold-300 dark:border-gold-700/60 shadow-sm'
                          : 'bg-gray-50/80 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                      }`}
                    >
                      {/* Left: Jump to Page Action Button */}
                      {onJumpToOccurrence && (
                        <button
                          onClick={() => {
                            onJumpToOccurrence(occ.page);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0 ${
                            isCurrent
                              ? 'bg-gold-600 hover:bg-gold-700 text-white'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                          title={`صفحہ ${occ.page} پر جائیں`}
                        >
                          <span>صفحہ {occ.page} کھولیں</span>
                          <ExternalLink size={12} />
                        </button>
                      )}

                      {/* Right: Location Details (Surah, Para, Ayah, Page, Line) */}
                      <div className="text-right flex-1" dir="rtl">
                        {/* Surah Name & Ayah */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold font-quran text-base text-gray-900 dark:text-gray-100">
                            {occ.surahName}
                          </span>
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-sans">
                            (آیت {occ.ayah})
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-gold-200 dark:bg-gold-800 text-gold-900 dark:text-gold-100 rounded font-bold">
                              یہاں موجود ہیں
                            </span>
                          )}
                        </div>

                        {/* Badges: Para, Page, Line */}
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold">
                            {juz ? juz.nameUrdu : `پارہ`}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold">
                            صفحہ {occ.page}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-gray-200/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 font-medium">
                            سطر {occ.line}
                          </span>
                          <span className="text-gray-400 text-[9px]">
                            (کلمہ نمبر {occ.position})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">
                  اس تلاش کے مطابق کوئی مقام نہیں ملا۔
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Word Details & Diacritics */}
        {activeTab === 'details' && (
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-400 block mb-1">قرآن میں کل تکرار</span>
                <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 font-sans">
                  {loadingOccurrences ? '...' : `${totalCount} مرتبہ`}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  مستند ڈیٹاسیٹ سے تصدیق شدہ
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] text-gray-400 block mb-1">تجویدی قاعدہ</span>
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  {word.tajweedSummary}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
                  کلر کوڈڈ
                </span>
              </div>
            </div>

            {/* Diacritics / Harakat Real Counts for this Word */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <h5 className="font-bold text-xs text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                <span>اس کلمہ کے اعراب (Word Diacritics Breakdown)</span>
                <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 font-sans">
                  {d ? d.letters : 0} حروف
                </span>
              </h5>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-sans">
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">زبر (Fatha)</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{d?.fatha ?? 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">زیر (Kasra)</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{d?.kasra ?? 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">پیش (Damma)</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{d?.damma ?? 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">تشدید</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{d?.shaddah ?? 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">سکون / جزم</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{d?.sukoon ?? 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">تنوین</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                    {(d?.fathatan ?? 0) + (d?.kasratan ?? 0) + (d?.dammatan ?? 0)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">کھڑی زبر</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">{d?.standingFatha ?? 0}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="block text-gray-400 text-[10px]">حرفِ مستعلیہ</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{d?.heavyLetters ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Applied Tajweed Rules Detail */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-right" dir="rtl">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block mb-1">
                صوتی و تجویدی قواعد:
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                اس کلمہ پر رنگین تجوید کے قواعد لاگو ہیں: {word.tajweedSummary}۔
              </p>
            </div>
          </div>
        )}

        {/* Bottom Close Button */}
        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95"
          >
            بند کریں (Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
};
