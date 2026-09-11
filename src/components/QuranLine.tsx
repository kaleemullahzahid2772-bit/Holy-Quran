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
      <div className="w-full my-0.5 sm:my-1 py-1 sm:py-1.5 px-3 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-lg border border-gold-400/60 shadow-sm flex items-center justify-between font-quran text-xs select-none">
        <span className="text-[10px] text-emerald-200 font-sans">
          آیاتها {line.totalAyahs}
        </span>
        <span className="text-sm sm:text-base font-bold text-gold-200 tracking-wider font-mushaf">
          سُوْرَةُ {line.surahName}
        </span>
        <span className="text-[10px] text-emerald-200 font-sans">
          {line.revelationType === 'Madani' ? 'مَدَنِيَّة' : 'مَكِّيَّة'}
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

  // Calculate content density of the line
  const { totalChars, wordCount } = useMemo(() => {
    let chars = 0;
    const words = line.words || [];
    for (const w of words) {
      chars += (w.text || w.markerText || '').length;
    }
    return { totalChars: chars, wordCount: words.length };
  }, [line.words]);

  // Typography scale classes calibrated to line length
  const fontSizeClass = useMemo(() => {
    if (totalChars > 115 || wordCount >= 14) {
      // Ultra-dense lines (e.g. Page 530, Page 381 L3-4)
      return 'text-[13px] sm:text-[15px] md:text-base lg:text-[1.125rem]';
    } else if (totalChars > 80 || wordCount >= 9) {
      // Dense lines (e.g. Page 3, 4, standard full lines)
      return 'text-[15px] sm:text-base md:text-lg lg:text-[1.28rem]';
    } else if (totalChars >= 40) {
      // Normal lines
      return 'text-base sm:text-lg md:text-xl lg:text-[1.42rem]';
    } else {
      // Short lines (e.g. Page 2 Surah Fatiha or short ayah endings)
      return 'text-lg sm:text-xl md:text-2xl lg:text-[1.65rem]';
    }
  }, [totalChars, wordCount]);

  const isSparseLine = wordCount <= 3;
  const isCompactWords = totalChars > 80 || wordCount >= 9;

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
          const fitScale = Math.max(0.68, (availableWidth - 1) / requiredWidth);
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
      {/* Words container, ordered from Right to Left */}
      <div
        ref={wordsContainerRef}
        className={`w-full flex items-center font-mushaf ${fontSizeClass} ${
          isSparseLine ? 'justify-center gap-6 sm:gap-10' : 'justify-between'
        }`}
        style={
          scale < 1
            ? {
                transform: `scale(${scale})`,
                transformOrigin: 'right center',
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
