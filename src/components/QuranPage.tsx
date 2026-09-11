import React from 'react';
import { BarChart2 } from 'lucide-react';
import { QuranPageData, QuranWordData, Surah, Juz } from '../types/quran';
import { QuranLine } from './QuranLine';
import { QuranIlluminatedPage } from './QuranIlluminatedPage';

interface QuranPageProps {
  pageData: QuranPageData;
  pageNumber: number;
  surah: Surah | null;
  juz: Juz | null;
  onSelectWord: (word: QuranWordData) => void;
  selectedWordId?: number;
  onOpenPageDetails?: () => void;
}

export const QuranPage: React.FC<QuranPageProps> = React.memo(({
  pageData,
  pageNumber,
  surah,
  juz,
  onSelectWord,
  selectedWordId,
  onOpenPageDetails,
}) => {
  // If page 2 (Surah Al-Fatiha) or page 3 (Surah Al-Baqarah 1-5), render authentic illuminated floral page
  if (pageNumber === 2 || pageNumber === 3) {
    return (
      <QuranIlluminatedPage
        pageData={pageData}
        pageNumber={pageNumber as 2 | 3}
        surah={surah}
        juz={juz}
        onSelectWord={onSelectWord}
        selectedWordId={selectedWordId}
        onOpenPageDetails={onOpenPageDetails}
      />
    );
  }

  // Convert number to Eastern Arabic numerals (e.g. 4 -> ۴)
  const pageNumberArabic = pageNumber.toLocaleString('ar-EG');

  return (
    <div className="w-full max-w-[820px] mx-auto my-2 p-1.5 sm:p-3 md:p-4 bg-[#fdfbf7] dark:bg-emerald-950/80 rounded-2xl shadow-xl border border-gold-400/40 select-none animate-fade-in box-border">
      {/* Outer Traditional Islamic Double Border */}
      <div className="p-1.5 sm:p-2.5 md:p-3 rounded-xl border-2 border-gold-500/60 bg-[#fffefc] dark:bg-[#031d16]/90 shadow-inner box-border overflow-hidden">
        {/* Inner Ornamental Border */}
        <div className="p-1.5 sm:p-3 md:p-4 rounded-lg border border-gold-400/40 relative overflow-hidden box-border">
          
          {/* Top Mushaf Header (Surah name, Page Number, Juz) */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gold-400/30 text-xs sm:text-sm font-quran text-emerald-900 dark:text-gold-200">
            {/* Right: Surah Name */}
            <div className="font-bold flex items-center gap-1">
              <span>{surah ? surah.nameArabic : 'سرورق'}</span>
            </div>

            {/* Center: Traditional Page Number */}
            <div className="px-3 py-0.5 rounded-full bg-gold-100/60 dark:bg-emerald-900/60 border border-gold-400/40 text-xs font-bold font-sans">
              {pageNumber} <span className="font-mushaf font-normal">({pageNumberArabic})</span>
            </div>

            {/* Left: Juz / Para Name */}
            <div className="font-bold flex items-center gap-1">
              <span>{juz ? `${juz.nameArabic} (${juz.number})` : ''}</span>
            </div>
          </div>

          {/* 16-Line Reading Grid */}
          <div className="flex flex-col justify-between min-h-[780px] sm:min-h-[880px] md:min-h-[980px] lg:min-h-[1050px] gap-1 sm:gap-1.5 md:gap-2 py-1 w-full max-w-full overflow-hidden">
            {pageData.lines && pageData.lines.length > 0 ? (
              pageData.lines.map((line) => (
                <QuranLine
                  key={line.lineNumber}
                  line={line}
                  onSelectWord={onSelectWord}
                  selectedWordId={selectedWordId}
                />
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                صفحہ کا متن لوڈ ہو رہا ہے...
              </div>
            )}
          </div>

          {/* Bottom Margin (Manzil, Details Button, & Page Number) */}
          <div className="pt-2.5 mt-2 border-t border-gold-400/30 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-sans">
            <span className="text-emerald-800 dark:text-emerald-300 font-bold font-mushaf text-xs">منزل ۱</span>
            
            {/* Prominent Page Details Button */}
            {onOpenPageDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPageDetails();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 border border-gold-400/50 cursor-pointer"
                title={`صفحہ ${pageNumber} کے مکمل اعداد و شمار دیکھیں`}
              >
                <BarChart2 size={13} className="text-gold-300" />
                <span>صفحہ کی تفصیلات (Details)</span>
              </button>
            )}

            <span className="font-sans font-bold text-xs text-gray-700 dark:text-gray-300">
              صفحہ {pageNumber}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
});

QuranPage.displayName = 'QuranPage';
