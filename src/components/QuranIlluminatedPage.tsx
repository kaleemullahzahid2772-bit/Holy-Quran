import React, { useRef, useState, useLayoutEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { QuranPageData, QuranWordData, Surah, Juz, QuranLineData } from '../types/quran';
import { QuranWord } from './QuranWord';

interface QuranIlluminatedPageProps {
  pageData: QuranPageData;
  pageNumber: 2 | 3;
  surah: Surah | null;
  juz: Juz | null;
  onSelectWord: (word: QuranWordData) => void;
  selectedWordId?: number;
  onOpenPageDetails?: () => void;
}

// Sub-component for an individual line inside the illuminated 6-line grid
const IlluminatedLineRow: React.FC<{
  line: QuranLineData;
  onSelectWord: (word: QuranWordData) => void;
  selectedWordId?: number;
}> = React.memo(({ line, onSelectWord, selectedWordId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  useLayoutEffect(() => {
    const checkFit = () => {
      if (containerRef.current && wordsRef.current) {
        const availableWidth = containerRef.current.clientWidth;
        const requiredWidth = wordsRef.current.scrollWidth;
        if (availableWidth > 0 && requiredWidth > availableWidth) {
          const fitScale = Math.max(0.62, (availableWidth - 4) / requiredWidth);
          setScale(fitScale);
        } else if (scale !== 1) {
          setScale(1);
        }
      }
    };

    checkFit();
    window.addEventListener('resize', checkFit);
    return () => window.removeEventListener('resize', checkFit);
  }, [line]);

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full flex items-center justify-between overflow-hidden transition-colors hover:bg-gold-500/10 rounded px-1"
    >
      <div
        ref={wordsRef}
        className="w-full flex items-center justify-between font-mushaf text-[16px] sm:text-2xl md:text-[1.75rem] lg:text-[2.2rem] leading-normal"
        style={
          scale < 1
            ? {
                transform: `scale(${scale})`,
                transformOrigin: 'right center',
                width: `${100 / scale}%`,
              }
            : undefined
        }
        dir="rtl"
      >
        {line.words.map((word, idx) => (
          <QuranWord
            key={word.id || idx}
            word={word}
            onSelectWord={onSelectWord}
            isSelected={word.id === selectedWordId}
            isCompact={false}
          />
        ))}
      </div>
    </div>
  );
});

IlluminatedLineRow.displayName = 'IlluminatedLineRow';

export const QuranIlluminatedPage: React.FC<QuranIlluminatedPageProps> = React.memo(({
  pageData,
  pageNumber,
  surah,
  juz,
  onSelectWord,
  selectedWordId,
  onOpenPageDetails,
}) => {
  const isPage2 = pageNumber === 2;
  const frameSrc = isPage2 ? '/images/frame_page_002.jpg' : '/images/frame_page_003.jpg';
  const aspectClass = isPage2 ? 'aspect-[1059/1670]' : 'aspect-[1067/1670]';

  // Extract the 6 non-empty text lines (skip header lines and empty padded lines)
  const textLines = pageData.lines.filter((l) => !l.isHeader && l.words && l.words.length > 0).slice(0, 6);

  // Surah Header metadata
  const surahHeaderTitle = isPage2 ? 'سُوْرَةُ الْفَاتِحَةِ مَكِّيَّةٌ' : 'سُوْرَةُ الْبَقَرَةِ مَدَنِيَّةٌ';
  const surahHeaderSubtitle = isPage2 ? 'آيَاتُهَا ٧  -  رُكُوْعُهَا ١' : 'آيَاتُهَا ۲۸۶  -  رُكُوْعَاتُهَا ۴۰';

  return (
    <div className="w-full max-w-[760px] mx-auto my-2 select-none animate-fade-in box-border">
      {/* Outer Container with exact aspect ratio of the authentic scanned page */}
      <div className={`relative w-full ${aspectClass} rounded-2xl shadow-2xl border-2 border-gold-500/60 overflow-hidden bg-[#fbf9f2] dark:brightness-95`}>
        {/* Authentic Illuminated Floral Border Background Image */}
        <img
          src={frameSrc}
          alt={`Holy Quran Page ${pageNumber} Floral Frame`}
          className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
        />

        {/* Digital Interactive Quran Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col pointer-events-auto">
          
          {/* 1. Surah Header Cartouche */}
          <div
            className="absolute flex flex-col items-center justify-center text-center select-none"
            style={{
              top: '13.3%',
              height: '6.9%',
              left: '20%',
              right: '20%',
            }}
          >
            <h2 className="font-mushaf font-bold text-xs sm:text-base md:text-lg lg:text-xl text-emerald-950 dark:text-emerald-900 tracking-wider">
              {surahHeaderTitle}
            </h2>
            <p className="font-quran text-[9px] sm:text-[11px] md:text-xs text-amber-900/90 font-medium">
              {surahHeaderSubtitle}
            </p>
          </div>

          {/* 2. Bismillah Cartouche */}
          <div
            className="absolute flex items-center justify-center text-center select-none"
            style={{
              top: '20.9%',
              height: '10.5%',
              left: '20%',
              right: '20%',
            }}
          >
            <h1 className="font-mushaf font-bold text-lg sm:text-2xl md:text-3xl lg:text-[2.35rem] text-emerald-950 dark:text-emerald-950 drop-shadow-sm tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h1>
          </div>

          {/* 3. The 6-Line Quran Text Grid */}
          <div
            className="absolute flex flex-col justify-between box-border py-1"
            style={{
              top: '32.0%',
              height: '48.8%',
              left: isPage2 ? '14.8%' : '14.1%',
              right: isPage2 ? '15.2%' : '15.8%',
            }}
          >
            {textLines.map((line, idx) => (
              <IlluminatedLineRow
                key={line.lineNumber || idx}
                line={line}
                onSelectWord={onSelectWord}
                selectedWordId={selectedWordId}
              />
            ))}
          </div>

          {/* 4. Interactive Bottom Footer overlay */}
          <div
            className="absolute flex items-center justify-between px-3"
            style={{
              bottom: '1.2%',
              left: '12%',
              right: '12%',
              height: '4%',
            }}
          >
            {/* Page Details Button */}
            {onOpenPageDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPageDetails();
                }}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-900/80 hover:bg-emerald-800 text-gold-200 rounded-full text-[10px] sm:text-xs font-bold shadow transition-transform hover:scale-105 active:scale-95 border border-gold-400/40 cursor-pointer"
                title={`صفحہ ${pageNumber} کے مکمل اعداد و شمار دیکھیں`}
              >
                <BarChart2 size={11} className="text-gold-300" />
                <span>تفصیلات</span>
              </button>
            )}

            {/* Page Number indicator */}
            <span className="font-sans font-bold text-[10px] sm:text-xs text-gray-700 bg-white/70 px-2 py-0.5 rounded-full border border-gold-400/30">
              صفحہ {pageNumber}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
});

QuranIlluminatedPage.displayName = 'QuranIlluminatedPage';
