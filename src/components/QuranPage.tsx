import React, { useState, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { QuranPageData, QuranWordData, Surah, Juz } from '../types/quran';
import { QuranLine } from './QuranLine';
import { QuranMarginalPanel } from './QuranMarginalPanel';
import { QuranDataService } from '../database/quranDataService';
import { THEMATIC_SUBJECTS } from '../data/quranThematicData';
import { toArabicNumerals } from './QuranWord';

interface QuranPageProps {
  pageData: QuranPageData;
  pageNumber: number;
  surah: Surah | null;
  juz: Juz | null;
  onSelectWord: (word: QuranWordData) => void;
  selectedWordId?: number;
  onOpenPageDetails?: () => void;
  showThematicColors?: boolean;
  showTajweedColors?: boolean;
  showMarginalVocabulary?: boolean;
  isDualMode?: boolean;
}

export const QuranPage: React.FC<QuranPageProps> = React.memo(({
  pageData,
  pageNumber,
  surah: propSurah,
  juz: propJuz,
  onSelectWord,
  selectedWordId,
  onOpenPageDetails,
  showThematicColors = true,
  showMarginalVocabulary = true,
  isDualMode = false,
}) => {
  const [isMobileVocabOpen, setIsMobileVocabOpen] = useState(false);

  // Derive verified Surah and Juz for this exact page
  const resolvedSurah = useMemo(() => {
    // 1. Check if lines on this page explicitly declare a surah title or word surah
    if (pageData?.lines) {
      for (const line of pageData.lines) {
        if (line.isHeader && line.headerType === 'surah_title' && line.surahName) {
          const s = QuranDataService.getSurahForPage(pageNumber);
          if (s) return s;
        }
        for (const w of (line.words || [])) {
          if (w.surah) {
            const s = QuranDataService.getSurahForPage(pageNumber);
            if (s) return s;
          }
        }
      }
    }
    return propSurah || QuranDataService.getSurahForPage(pageNumber);
  }, [pageData, pageNumber, propSurah]);

  const resolvedJuz = useMemo(() => {
    return propJuz || QuranDataService.getJuzForPage(pageNumber);
  }, [pageNumber, propJuz]);

  // Page Thematic Data (subjects & vocabulary)
  const pageThematic = QuranDataService.getPageThematicData(pageNumber);
  const subjects = pageThematic?.subjects || [];
  const vocabulary = pageThematic?.vocabulary || [];

  // Convert page number to Eastern Arabic numerals (e.g. 3 -> ۳)
  const pageNumberArabic = toArabicNumerals(pageNumber);

  // In RTL Arabic books, odd pages are left-hand pages and even pages are right-hand pages
  const isOddPage = pageNumber % 2 !== 0;

  return (
    <div className="w-full flex justify-center items-start gap-3 lg:gap-5 mx-auto my-1 sm:my-2 px-0.5 sm:px-2">
      {/* On desktop single-page view, place vocabulary panel on the outer margin */}
      {!isDualMode && isOddPage && showMarginalVocabulary && vocabulary.length > 0 && (
        <div className="hidden xl:block order-1">
          <QuranMarginalPanel
            vocabulary={vocabulary}
            pageNumber={pageNumber}
          />
        </div>
      )}

      {/* Main Authentic Mushaf Page Container with Standardized Aspect Ratio & Height */}
      <div className={`w-full ${isDualMode ? 'max-w-[500px]' : 'max-w-[540px]'} h-full flex flex-col justify-between p-0.5 sm:p-1.5 md:p-2 bg-[#fdfbf7] dark:bg-[#031d16] rounded-xl sm:rounded-2xl shadow-xl border border-[#c59d43]/70 select-none animate-fade-in box-border order-2`}>
        {/* Outer Traditional Islamic Double Border */}
        <div className="h-full flex flex-col justify-between p-0.5 sm:p-1 md:p-1.5 rounded-lg sm:rounded-xl border border-[#b88c3a] bg-[#fffefc] dark:bg-[#021812] shadow-inner box-border overflow-hidden flex-grow">
          {/* Inner Ornamental Border with Gold Framing */}
          <div className="h-full flex flex-col justify-between px-1 py-1 sm:px-2 sm:py-1.5 md:px-2.5 md:py-2 rounded-md sm:rounded-lg border border-[#c59d43]/50 relative overflow-hidden box-border flex-grow">
            
            {/* Top Mushaf Header (Surah name, Page Number, Juz) */}
            <div className="flex items-center justify-between pb-1 mb-1 border-b sm:border-b-2 border-[#c59d43]/40 text-xs sm:text-sm font-mushaf select-none shrink-0">
              {/* Right: Surah Name */}
              <div className="flex items-center gap-1">
                <span className="font-mushaf font-bold text-xs sm:text-sm md:text-base text-[#111827] dark:text-gold-200">
                  {resolvedSurah ? `سُورَةُ ${resolvedSurah.nameArabic}` : ''}
                </span>
              </div>

              {/* Center: Traditional Page Number */}
              <div className="flex items-center gap-0.5 sm:gap-1 px-2.5 py-0.5 rounded-full bg-[#fbf6ea] dark:bg-emerald-950/80 border border-[#c59d43]/60 text-xs sm:text-sm font-bold font-mushaf text-[#b45309] dark:text-gold-300 shadow-2xs">
                <span>ـ</span>
                <span className="font-bold">{pageNumberArabic}</span>
                <span>ـ</span>
              </div>

              {/* Left: Juz / Para Name */}
              <div className="flex items-center gap-1">
                <span className="font-mushaf font-bold text-xs sm:text-sm md:text-base text-[#111827] dark:text-gold-200">
                  {resolvedJuz ? `الجُزْءُ ${toArabicNumerals(resolvedJuz.number)}` : ''}
                </span>
              </div>
            </div>

            {/* 15-Line Reading Grid with Standardized Height Across All Pages */}
            <div className="flex flex-col justify-between flex-grow gap-y-0.5 sm:gap-y-1 py-1 w-full max-w-full overflow-hidden">
              {pageData?.lines && pageData.lines.length > 0 ? (
                pageData.lines.map((line) => (
                  <QuranLine
                    key={line.lineNumber}
                    line={line}
                    onSelectWord={onSelectWord}
                    selectedWordId={selectedWordId}
                    showThematicColors={showThematicColors}
                  />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400 py-12">
                  صفحہ کا متن لوڈ ہو رہا ہے...
                </div>
              )}
            </div>

            {/* Bottom Section: Standardized Thematic Subject Legend Box */}
            <div className="min-h-[52px] max-h-[62px] flex items-center mt-1 pt-1 sm:mt-1.5 sm:pt-1.5 border-t sm:border-t-2 border-[#c59d43]/40 shrink-0 overflow-y-auto">
              {showThematicColors && subjects.length > 0 ? (
                <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2" dir="rtl">
                  {/* Ornate Emblem Badge */}
                  <div className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-[#d4af37]/20 via-[#c59d43]/30 to-[#d4af37]/20 border border-[#c59d43]/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="font-mushaf font-bold text-[10px] sm:text-xs text-[#3b2a06] dark:text-gold-200 tracking-wider">
                      التَّفْصِيلُ المَوْضُوعِيُّ
                    </span>
                  </div>

                  {/* Thematic Subject Swatches */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    {subjects.slice(0, 2).map((s, idx) => {
                      const theme = THEMATIC_SUBJECTS[s.subjectId];
                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: theme?.colorLight,
                            borderColor: theme?.colorBorderLight,
                          }}
                          className="flex items-center justify-between px-2 py-0.5 rounded border text-gray-900 dark:text-gray-100 shadow-2xs transition-colors dark:bg-opacity-25"
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span
                              style={{ backgroundColor: theme?.badgeBg }}
                              className="w-3.5 h-3.5 rounded text-white font-sans text-[9px] font-bold flex items-center justify-center shadow-xs shrink-0"
                            >
                              {idx + 1}
                            </span>
                            <span className="font-mushaf font-bold text-[10px] sm:text-xs text-[#111827] dark:text-emerald-100 truncate">
                              {s.titleArabic}
                            </span>
                            <span className="hidden lg:inline text-[9px] sm:text-[10px] text-gray-600 dark:text-gray-300 font-sans truncate">
                              ({s.titleUrdu})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="px-1.5 py-0.2 rounded bg-white/80 dark:bg-black/40 text-[9px] sm:text-[10px] font-bold font-mushaf text-[#2b2b2b] dark:text-gray-200 border border-gold-400/30 whitespace-nowrap">
                              الآيات {toArabicNumerals(s.fromAyah)}{s.fromAyah !== s.toAyah ? `-${toArabicNumerals(s.toAyah)}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center py-1 opacity-40">
                  <span className="text-[10px] text-gray-400 font-mushaf">مصحف المدينة النبوية</span>
                </div>
              )}
            </div>

            {/* Bottom Margin (Publisher imprint, central page number, details button) */}
            <div className="pt-1 mt-1 sm:pt-1 sm:mt-1 border-t border-[#c59d43]/30 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-sans shrink-0">
              <span className="hidden sm:inline text-[#8c6b2d] dark:text-gold-300 font-bold font-mushaf text-xs">
                مصحف دار الفجر الإسلامي (التفصيل الموضوعي)
              </span>
              
              {/* Central Traditional Page Number */}
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fbf6ea] dark:bg-emerald-950/80 border border-[#c59d43]/60 text-xs font-bold font-mushaf text-[#b45309] dark:text-gold-200">
                <span>ـ</span>
                <span className="text-xs sm:text-sm">{pageNumberArabic}</span>
                <span>ـ</span>
              </div>

              {/* Page Details Button */}
              {onOpenPageDetails ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPageDetails();
                  }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 bg-gradient-to-r from-[#b48a3c] to-[#996d2a] hover:from-[#996d2a] hover:to-[#7d561e] text-white rounded-full text-[10px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 border border-gold-400/50 cursor-pointer"
                  title={`صفحہ ${pageNumber} کے اعداد و شمار اور موضوعات`}
                >
                  <BarChart2 size={11} className="text-gold-200" />
                  <span>تفصیلات</span>
                </button>
              ) : (
                <span className="text-[10px] text-gray-400">صفحہ {pageNumber}</span>
              )}
            </div>

          </div>
        </div>

        {/* Mobile / Tablet Marginal Vocabulary Collapsible Sheet */}
        {showMarginalVocabulary && vocabulary.length > 0 && (
          <QuranMarginalPanel
            vocabulary={vocabulary}
            pageNumber={pageNumber}
            isOpenMobile={isMobileVocabOpen}
            onToggleMobile={() => setIsMobileVocabOpen(prev => !prev)}
          />
        )}
      </div>

      {/* On desktop single-page view, place vocabulary panel on the outer margin for even pages */}
      {!isDualMode && !isOddPage && showMarginalVocabulary && vocabulary.length > 0 && (
        <div className="hidden xl:block order-3">
          <QuranMarginalPanel
            vocabulary={vocabulary}
            pageNumber={pageNumber}
          />
        </div>
      )}
    </div>
  );
});

QuranPage.displayName = 'QuranPage';
