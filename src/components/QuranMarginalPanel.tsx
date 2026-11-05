import React from 'react';
import { BookMarked, ChevronDown, ChevronUp } from 'lucide-react';
import { MarginalWordMeaning } from '../types/quran';

interface QuranMarginalPanelProps {
  vocabulary: MarginalWordMeaning[];
  pageNumber: number;
  isOpenMobile?: boolean;
  onToggleMobile?: () => void;
}

export const QuranMarginalPanel: React.FC<QuranMarginalPanelProps> = ({
  vocabulary,
  pageNumber,
  isOpenMobile = false,
  onToggleMobile,
}) => {
  if (!vocabulary || vocabulary.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop / Large Screen Side Margin Column (تفسير كلمات القرآن - دار الفجر) */}
      <aside
        className="hidden xl:flex flex-col w-64 shrink-0 bg-[#fffdf9] dark:bg-[#032018]/90 rounded-2xl p-3 border-2 border-gold-400/50 shadow-md self-start sticky top-20 select-none animate-fade-in"
        dir="rtl"
      >
        {/* Header matching Dar al Fajr marginal commentary */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-gold-400/40 text-emerald-950 dark:text-gold-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-emerald-900 flex items-center justify-center text-amber-800 dark:text-gold-300 font-bold border border-gold-400/40">
              <BookMarked size={14} />
            </div>
            <div>
              <h4 className="font-mushaf font-bold text-sm tracking-wide text-[#2a1a04] dark:text-gold-200">
                تَفْسِيرُ كَلِمَاتِ القُرْآنِ
              </h4>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 block -mt-0.5">
                معاني المفردات والغريب
              </span>
            </div>
          </div>
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-emerald-950 border border-gold-400/30 text-amber-800 dark:text-gold-300">
            {vocabulary.length}
          </span>
        </div>

        {/* Word items list */}
        <div className="space-y-2 overflow-y-auto max-h-[78vh] pr-1 scrollbar-thin">
          {vocabulary.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[#faf7f0]/80 dark:bg-emerald-950/40 border border-gold-300/40 hover:border-amber-500/60 transition-colors shadow-2xs"
            >
              <div className="flex items-baseline justify-between gap-1 pb-1 border-b border-gold-200/40 dark:border-emerald-900/40">
                <span className="font-mushaf font-bold text-base text-[#1a1a1a] dark:text-gold-200">
                  {item.word}
                </span>
                <span className="text-[10px] font-mushaf text-amber-800 dark:text-gold-400 bg-amber-100/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                  آية {item.ayahNumber.toLocaleString('ar-EG')}
                </span>
              </div>
              <div className="text-xs text-emerald-950 dark:text-emerald-200 font-mushaf font-semibold mt-1 leading-snug">
                {item.meaningArabic}
              </div>
              {item.meaningUrdu && (
                <div className="text-[11px] text-gray-700 dark:text-gray-300 font-sans mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                  {item.meaningUrdu}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Drawer / Bottom Collapsible Sheet */}
      <div className="xl:hidden w-full max-w-[840px] mx-auto px-2 mt-2 select-none" dir="rtl">
        <button
          type="button"
          onClick={onToggleMobile}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#b48a3c] via-[#d4af37] to-[#b48a3c] text-white rounded-xl shadow-sm border border-gold-500 text-xs font-bold"
        >
          <div className="flex items-center gap-2">
            <BookMarked size={15} className="text-white drop-shadow" />
            <span className="font-mushaf text-sm tracking-wide text-white drop-shadow-xs">
              تَفْسِيرُ كَلِمَاتِ الصَّفْحَةِ ({vocabulary.length})
            </span>
          </div>
          {isOpenMobile ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        {isOpenMobile && (
          <div className="mt-1.5 p-3 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gold-400/40 shadow-lg space-y-2 animate-fade-in max-h-64 overflow-y-auto">
            {vocabulary.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mushaf font-bold text-sm text-emerald-950 dark:text-gold-300">
                    {item.word}
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mushaf font-bold">
                    آية {item.ayahNumber.toLocaleString('ar-EG')}
                  </span>
                </div>
                <div className="text-xs text-gray-800 dark:text-gray-200 font-mushaf mt-0.5">
                  {item.meaningArabic}
                </div>
                {item.meaningUrdu && (
                  <div className="text-[11px] text-gray-600 dark:text-gray-400 font-sans mt-0.5">
                    {item.meaningUrdu}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
