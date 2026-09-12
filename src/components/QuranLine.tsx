import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { QuranLineData, QuranWordData } from '../types/quran';
import { QuranWord } from './QuranWord';

interface QuranLineProps {
  line: QuranLineData;
  onSelectWord: (word: QuranWordData) => void;
  selectedWordId?: number;
}

export const QuranLine: React.FC<QuranLineProps> = React.memo(({
  line,
  onSelectWord,
  selectedWordId,
}) => {
  // 1. Surah Title Banner Line
  if (line.isHeader && line.headerType === 'surah_title') {
    return (
      <div className="w-full my-0.5 sm:my-1 py-1 px-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-lg border border-gold-400/60 shadow-sm flex items-center justify-between font-quran text-xs select-none">
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 font-sans">
          <span>آیاتها {line.totalAyahs}</span>
          <span className="hidden sm:inline">| {line.revelationType === 'Madani' ? 'مَدَنِيَّة' : 'مَكِّيَّة'}</span>
        </div>
        {line.includeBismillah ? (
          <span className="text-xs sm:text-sm font-mushaf font-bold text-gold-100 px-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
        ) : null}
        <span className="text-xs sm:text-base font-bold text-gold-200 tracking-wider font-mushaf">
          سُوْرَةُ {line.surahName}
        </span>
      </div>
    );
  }

  // 2. Bismillah Banner Line
  if (line.isHeader && line.headerType === 'bismillah') {
    return (
      <div className="w-full my-0.5 py-0.5 text-center font-mushaf text-base sm:text-lg md:text-xl font-bold text-emerald-950 dark:text-gold-300 select-none">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
    );
  }

  // 3. Dua Khatm al-Quran Banner Line
  if (line.isHeader && line.headerType === 'dua_khatam') {
    return (
      <div className="w-full my-0.5 py-1 px-3 bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-800 text-white rounded-lg border border-gold-400/60 shadow-sm text-center font-mushaf text-sm sm:text-base font-bold text-gold-200 select-none">
        دُعَاءُ خَتْمِ الْقُرْآنِ الْعَظِيمِ
      </div>
    );
  }

  // Calculate content density of the line
  const { totalChars, wordCount } = useMemo(() => {
    let chars = 0;
    const words = line.words || [];
    for (const w of words) {
      chars += (w.text || w.markerText || '').length;
    }
    return { totalChars: chars, wordCount: words.length };
  }, [line.words]);

  const isShortEndLine = wordCount <= 3;
  const isCompactWords = totalChars > 85 || wordCount >= 10;

  // Typography scale classes calibrated to line length (consistent and uniform across Mushaf)
  const fontSizeClass = useMemo(() => {
    if (totalChars > 115 || wordCount >= 14) {
      // Ultra-dense lines
      return 'text-sm sm:text-base md:text-lg lg:text-[1.48rem]';
    } else if (totalChars > 85 || wordCount >= 10) {
      // Dense lines (standard full lines)
      return 'text-base sm:text-lg md:text-xl lg:text-[1.62rem]';
    } else if (totalChars >= 40) {
      // Normal lines
      return 'text-base sm:text-xl md:text-2xl lg:text-[1.72rem]';
    } else {
      // Short lines (e.g. short ayah endings)
      return 'text-lg sm:text-xl md:text-2xl lg:text-[1.82rem]';
    }
  }, [totalChars, wordCount]);

  // Auto-fit protection: Ensures line NEVER overflows the golden border
  const lineContainerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  useLayoutEffect(() => {
    const checkFit = () => {
      if (lineContainerRef.current && wordsContainerRef.current) {
        const availableWidth = lineContainerRef.current.clientWidth;
        const requiredWidth = wordsContainerRef.current.scrollWidth;
        if (availableWidth > 0 && requiredWidth > availableWidth) {
          const fitScale = Math.max(0.60, (availableWidth - 1) / requiredWidth);
          setScale(fitScale);
        } else if (scale !== 1) {
          setScale(1);
        }
      }
    };

    checkFit();
    window.addEventListener('resize', checkFit);
    return () => window.removeEventListener('resize', checkFit);
  }, [line, fontSizeClass, totalChars, wordCount]);

  // 3. Regular Quran Text Line (1 of 16 lines)
  return (
    <div
      ref={lineContainerRef}
      className="w-full max-w-full relative flex items-center overflow-hidden leading-relaxed group transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 rounded py-0.5 box-border"
    >
      {/* Words container, strictly ordered from Right to Left, fully justified edge-to-edge */}
      <div
        ref={wordsContainerRef}
        className={`w-full flex items-center font-mushaf ${fontSizeClass} ${
          isShortEndLine ? 'justify-center gap-x-2 sm:gap-x-3' : 'justify-between'
        }`}
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
            isCompact={isCompactWords}
          />
        ))}
      </div>

      {/* Subtle Line Number indicator in left margin (absolute so it takes 0 width in flow) */}
      <span className="absolute left-0 text-[8px] text-gray-300 dark:text-gray-700 font-sans select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {line.lineNumber}
      </span>
    </div>
  );
});

QuranLine.displayName = 'QuranLine';
