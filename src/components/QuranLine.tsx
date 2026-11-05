import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { QuranLineData, QuranWordData, ThematicSubjectId } from '../types/quran';
import { QuranWord } from './QuranWord';
import { THEMATIC_SUBJECTS } from '../data/quranThematicData';

interface QuranLineProps {
  line: QuranLineData;
  onSelectWord: (word: QuranWordData) => void;
  selectedWordId?: number;
  showThematicColors?: boolean;
  showTajweedColors?: boolean;
}

export const QuranLine: React.FC<QuranLineProps> = React.memo(({
  line,
  onSelectWord,
  selectedWordId,
  showThematicColors = true,
  showTajweedColors = true,
}) => {
  // 1. Surah Title Banner Line (Authentic Gilded Islamic Frame)
  if (line.isHeader && line.headerType === 'surah_title') {
    return (
      <div className="w-full my-1 sm:my-1.5 py-1 sm:py-1.5 px-2.5 sm:px-4 bg-gradient-to-r from-[#b48a3c] via-[#d4af37] to-[#b48a3c] text-white rounded-lg border-2 border-[#8c6b2d] shadow-sm flex items-center justify-between font-mushaf select-none relative overflow-hidden">
        {/* Subtle geometric islamic pattern overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
        
        {/* Right side (RTL Start): Ayahs count & Revelation */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mushaf text-[#2a1a04] font-bold z-10 bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full border border-gold-600/30">
          <span>آيَاتُهَا {line.totalAyahs}</span>
          <span className="opacity-40">|</span>
          <span>{line.revelationType === 'Madani' ? 'مَدَنِيَّةٌ' : 'مَكِّيَّةٌ'}</span>
        </div>

        {/* Center: Surah Name in Regal Calligraphy */}
        <div className="text-sm sm:text-lg md:text-xl font-bold text-[#1f1604] dark:text-white tracking-wide font-mushaf z-10 drop-shadow-xs">
          سُوْرَةُ {line.surahName}
        </div>

        {/* Left side (RTL End): Traditional corner imprint */}
        <div className="text-[10px] sm:text-xs font-mushaf text-[#2a1a04] font-bold z-10 bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full border border-gold-600/30">
          <span>نُزُولُهَا</span>
        </div>
      </div>
    );
  }

  // 2. Bismillah Banner Line
  if (line.isHeader && line.headerType === 'bismillah') {
    return (
      <div className="w-full my-0.5 sm:my-1 py-0.5 sm:py-1 text-center font-mushaf text-base sm:text-xl md:text-2xl font-bold text-[#1a1a1a] dark:text-gold-200 select-none tracking-wide">
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </div>
    );
  }

  // 3. Dua Khatm al-Quran Banner Line
  if (line.isHeader && line.headerType === 'dua_khatam') {
    return (
      <div className="w-full my-1 py-1.5 px-3 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 text-white rounded-lg border-2 border-gold-500 shadow-sm text-center font-mushaf text-xs sm:text-base font-bold select-none">
        دُعَاءُ خَتْمِ الْقُرْآنِ الْعَظِيمِ
      </div>
    );
  }

  const wordCount = (line.words || []).length;
  const isShortEndLine = wordCount <= 3;

  // Group consecutive words by thematic subject
  const thematicGroups = useMemo(() => {
    if (!showThematicColors) {
      return [{ subjectId: undefined, words: line.words || [] }];
    }
    const groups: { subjectId?: ThematicSubjectId; words: QuranWordData[] }[] = [];
    let current: { subjectId?: ThematicSubjectId; words: QuranWordData[] } | null = null;

    for (const w of line.words || []) {
      const sId = w.subjectId || line.subjectId;
      if (!current || current.subjectId !== sId) {
        current = { subjectId: sId, words: [w] };
        groups.push(current);
      } else {
        current.words.push(w);
      }
    }
    return groups;
  }, [line.words, line.subjectId, showThematicColors]);

  // Check if the entire line belongs to a single subject
  const singleTheme = useMemo(() => {
    if (!showThematicColors || thematicGroups.length !== 1) return null;
    const sId = thematicGroups[0]?.subjectId;
    return sId ? THEMATIC_SUBJECTS[sId] : null;
  }, [thematicGroups, showThematicColors]);

  // Unified, harmonious typography across all lines on the page
  // Fluid font size scaling gracefully from mobile to desktop
  const uniformTypographyClass = 'text-[15px] xs:text-[16px] sm:text-[18px] md:text-[21px] lg:text-[23px] xl:text-[24px]';

  // Protective auto-fit: only scales in rare case of overflow on extremely narrow phones
  const lineContainerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  useLayoutEffect(() => {
    const checkFit = () => {
      if (lineContainerRef.current && wordsContainerRef.current) {
        const availableWidth = lineContainerRef.current.clientWidth;
        const requiredWidth = wordsContainerRef.current.scrollWidth;
        if (availableWidth > 0 && requiredWidth > availableWidth + 1) {
          const fitScale = Math.max(0.72, (availableWidth - 1) / requiredWidth);
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
      ref={lineContainerRef}
      style={
        singleTheme
          ? {
              backgroundColor: singleTheme.colorLight,
            }
          : undefined
      }
      className={`w-full max-w-full relative flex items-center overflow-hidden py-0.5 sm:py-0.75 px-1 sm:px-1.5 box-border rounded-[2px] transition-colors leading-[2.1] sm:leading-[2.3] md:leading-[2.4] ${
        singleTheme ? 'dark:bg-opacity-20' : ''
      }`}
    >
      {/* Words container, strictly ordered from Right to Left */}
      <div
        ref={wordsContainerRef}
        className={`w-full flex items-center font-mushaf ${uniformTypographyClass} ${
          isShortEndLine ? 'justify-center gap-x-3 sm:gap-x-5' : 'justify-between'
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
        {singleTheme || thematicGroups.length <= 1 ? (
          // Standard full-width line: words spaced evenly and naturally
          (line.words || []).map((word, idx) => (
            <QuranWord
              key={word.id || idx}
              word={word}
              onSelectWord={onSelectWord}
              isSelected={word.id === selectedWordId}
              showTajweedColors={showTajweedColors}
            />
          ))
        ) : (
          // Multi-theme transition line: Seamless background slices without gaps or pills
          thematicGroups.map((group, gIdx) => {
            const theme = group.subjectId ? THEMATIC_SUBJECTS[group.subjectId] : null;
            return (
              <div
                key={gIdx}
                style={
                  theme && showThematicColors
                    ? {
                        backgroundColor: theme.colorLight,
                      }
                    : undefined
                }
                className={`inline-flex items-center justify-between flex-grow px-1 py-0.5 rounded-[2px] transition-colors ${
                  theme ? 'dark:bg-opacity-20' : ''
                }`}
              >
                {group.words.map((word, idx) => (
                  <QuranWord
                    key={word.id || idx}
                    word={word}
                    onSelectWord={onSelectWord}
                    isSelected={word.id === selectedWordId}
                    showTajweedColors={showTajweedColors}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Subtle line number on hover (desktop only) */}
      <span className="hidden md:block absolute left-0 text-[8px] text-gray-300 dark:text-gray-700 font-sans select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        {line.lineNumber}
      </span>
    </div>
  );
});

QuranLine.displayName = 'QuranLine';
