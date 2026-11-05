import React, { useState } from 'react';
import { BarChart2, BookMarked } from 'lucide-react';
import { QuranPageData, QuranWordData, Surah, Juz } from '../types/quran';
import { QuranLine } from './QuranLine';
import { QuranIlluminatedPage } from './QuranIlluminatedPage';
import { QuranMarginalPanel } from './QuranMarginalPanel';
import { QuranDataService } from '../database/quranDataService';
import { THEMATIC_SUBJECTS } from '../data/quranThematicData';

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
  surah,
  juz,
  onSelectWord,
  selectedWordId,
  onOpenPageDetails,
  showThematicColors = true,
  showTajweedColors = true,
  showMarginalVocabulary = true,
  isDualMode = false,
}) => {
  const [isMobileVocabOpen, setIsMobileVocabOpen] = useState(false);

  // If page 1 (Surah Al-Fatiha) or page 2 (Surah Al-Baqarah 1-5), render authentic illuminated floral page
  if (pageNumber === 1 || pageNumber === 2) {
    return (
      <QuranIlluminatedPage
        pageData={pageData}
        pageNumber={pageNumber as 1 | 2}
        surah={surah}
        juz={juz}
        onSelectWord={onSelectWord}
        selectedWordId={selectedWordId}
        onOpenPageDetails={onOpenPageDetails}
      />
    );
  }

  // Page Thematic Data (subjects & vocabulary)
  const pageThematic = QuranDataService.getPageThematicData(pageNumber);
  const subjects = pageThematic?.subjects || [];
  const vocabulary = pageThematic?.vocabulary || [];

  // Convert number to Eastern Arabic numerals (e.g. 3 -> ۳)
  const pageNumberArabic = typeof pageNumber === 'number' && !isNaN(pageNumber)
    ? pageNumber.toLocaleString('ar-EG')
    : (pageNumber ? String(pageNumber) : '');

  // In RTL Arabic books, odd pages are left-hand pages and even pages are right-hand pages
  const isOddPage = pageNumber % 2 !== 0;

  return (
    <div className="w-full flex justify-center items-start gap-4 lg:gap-6 mx-auto my-1 sm:my-2 px-1 sm:px-2">
      {/* On desktop single-page view, place vocabulary panel on the outer margin */}
      {!isDualMode && isOddPage && showMarginalVocabulary && vocabulary.length > 0 && (
        <div className="hidden xl:block order-1">
          <QuranMarginalPanel
            vocabulary={vocabulary}
            pageNumber={pageNumber}
          />
        </div>
      )}

      {/* Main Authentic Mushaf Page Container */}
      <div className={`w-full ${isDualMode ? 'max-w-[700px]' : 'max-w-[800px]'} p-1 sm:p-2 md:p-3 bg-[#fdfbf7] dark:bg-[#031d16] rounded-xl sm:rounded-2xl shadow-xl border sm:border-2 border-[#c59d43]/70 select-none animate-fade-in box-border order-2`}>
        {/* Outer Traditional Islamic Double Border */}
        <div className="p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl border sm:border-2 border-[#b88c3a] bg-[#fffefc] dark:bg-[#021812] shadow-inner box-border overflow-hidden">
          {/* Inner Ornamental Border with Gold Framing */}
          <div className="px-1.5 py-1 sm:px-2.5 sm:py-2 md:px-3.5 md:py-2.5 rounded-md sm:rounded-lg border border-[#c59d43]/50 relative overflow-hidden box-border">
            
            {/* Top Mushaf Header (Surah name, Page Number, Juz) */}
            <div className="flex items-center justify-between pb-1 sm:pb-2 mb-1.5 sm:mb-2 border-b sm:border-b-2 border-[#c59d43]/40 text-xs sm:text-sm font-mushaf text-[#1a1a1a] dark:text-gold-200 select-none">
              {/* Right: Surah Name */}
              <div className="flex items-center gap-1">
                <span className="font-mushaf font-bold text-xs sm:text-sm md:text-base text-[#1f2937] dark:text-gold-200">
                  {surah ? `سُورَةُ ${surah.nameArabic}` : ''}
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
                <span className="font-mushaf font-bold text-xs sm:text-sm md:text-base text-[#1f2937] dark:text-gold-200">
                  {juz ? `الجُزْءُ ${juz.number.toLocaleString('ar-EG')}` : ''}
                </span>
              </div>
            </div>

            {/* 15-Line Reading Grid with Fluid Natural Height */}
            <div className="flex flex-col justify-between min-h-[560px] xs:min-h-[620px] sm:min-h-[720px] md:min-h-[820px] lg:min-h-[900px] gap-0.5 sm:gap-1 md:gap-1.5 py-0.5 sm:py-1 w-full max-w-full overflow-hidden">
              {pageData.lines && pageData.lines.length > 0 ? (
                pageData.lines.map((line) => (
                  <QuranLine
                    key={line.lineNumber}
                    line={line}
                    onSelectWord={onSelectWord}
                    selectedWordId={selectedWordId}
                    showThematicColors={showThematicColors}
                    showTajweedColors={showTajweedColors}
                  />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400 py-12">
                  صفحہ کا متن لوڈ ہو رہا ہے...
                </div>
              )}
            </div>

            {/* Bottom Section: Thematic Subject Legend (دَلِيلُ أَلْوَانِ التَّفْصِيلِ المَوْضُوعِيِّ) */}
            {showThematicColors && subjects.length > 0 && (
              <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t sm:border-t-2 border-[#c59d43]/40">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2" dir="rtl">
                  {/* Ornate Emblem Badge */}
                  <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#d4af37]/20 via-[#c59d43]/30 to-[#d4af37]/20 border border-[#c59d43]/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="font-mushaf font-bold text-[11px] sm:text-xs text-[#3b2a06] dark:text-gold-200 tracking-wider">
                      التَّفْصِيلُ المَوْضُوعِيُّ
                    </span>
                  </div>

                  {/* Thematic Subject Swatches */}
                  <div className="flex-1 flex flex-col gap-1">
                    {subjects.map((s, idx) => {
                      const theme = THEMATIC_SUBJECTS[s.subjectId];
                      return (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: theme?.colorLight,
                            borderColor: theme?.colorBorderLight,
                          }}
                          className="flex items-center justify-between px-2 py-0.5 sm:py-1 rounded border text-gray-900 dark:text-gray-100 shadow-2xs transition-colors dark:bg-opacity-25"
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span
                              style={{ backgroundColor: theme?.badgeBg }}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-white font-sans text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs shrink-0"
                            >
                              {idx + 1}
                            </span>
                            <span className="font-mushaf font-bold text-[11px] sm:text-xs md:text-sm text-[#111827] dark:text-emerald-100 truncate">
                              {s.titleArabic}
                            </span>
                            <span className="hidden lg:inline text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-300 font-sans truncate">
                              ({s.titleUrdu})
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-black/40 text-[9px] sm:text-[10px] font-bold font-mushaf text-[#2b2b2b] dark:text-gray-200 border border-gold-400/30 whitespace-nowrap">
                              الآيات {s.fromAyah.toLocaleString('ar-EG')}{s.fromAyah !== s.toAyah ? `-${s.toAyah.toLocaleString('ar-EG')}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Margin (Publisher imprint, central page number, details button) */}
            <div className="pt-1.5 mt-1.5 sm:pt-2 sm:mt-2 border-t border-[#c59d43]/30 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-sans">
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
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 bg-gradient-to-r from-[#b48a3c] to-[#996d2a] hover:from-[#996d2a] hover:to-[#7d561e] text-white rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs transition-all hover:scale-105 active:scale-95 border border-gold-400/50 cursor-pointer"
                  title={`صفحہ ${pageNumber} کے اعداد و شمار اور موضوعات`}
                >
                  <BarChart2 size={12} className="text-gold-200" />
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
