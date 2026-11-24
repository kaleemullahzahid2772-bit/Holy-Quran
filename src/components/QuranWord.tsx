import React, { useMemo } from 'react';
import { QuranWordData } from '../types/quran';
import { cleanQuranWordText } from '../database/quranDataService';

interface QuranWordProps {
  word: QuranWordData;
  onSelectWord: (word: QuranWordData) => void;
  isSelected?: boolean;
  isCompact?: boolean;
  showTajweedColors?: boolean;
  themeBackground?: string;
}

const EASTERN_ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumerals(num: number | string): string {
  const nStr = String(num).replace(/[^0-9]/g, '');
  if (!nStr) return String(num).replace(/[۝\s]/g, '').trim();
  return nStr.split('').map(d => EASTERN_ARABIC_DIGITS[parseInt(d, 10)] ?? d).join('');
}

/**
 * Beautiful Golden Quranic Ayah Rosette Marker
 * Exact authentic Dar al-Fajr / Madani Mushaf styling
 */
export const AyahEndMarker: React.FC<{ ayahNumber: number | string }> = React.memo(({ ayahNumber }) => {
  const arabicNum = toArabicNumerals(ayahNumber);
  const digitCount = arabicNum.length;
  // Dynamically calibrate font size for 1, 2, or 3-digit ayah numbers (e.g. 1 to 286)
  const fontSize = digitCount >= 3 ? 10.5 : digitCount === 2 ? 12.5 : 14.5;
  const yPos = digitCount >= 3 ? 24 : 24.5;

  return (
    <span
      className="inline-flex items-center justify-center align-middle mx-1 sm:mx-1.5 select-none shrink-0 drop-shadow-2xs"
      style={{ verticalAlign: 'middle', lineHeight: 1 }}
      title={`آية ${arabicNum}`}
      aria-label={`آية ${arabicNum}`}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-[1.28em] h-[1.28em] min-w-[22px] min-h-[22px] max-w-[34px] max-h-[34px]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dfba4e" />
            <stop offset="45%" stopColor="#b48a3c" />
            <stop offset="100%" stopColor="#8c6b2d" />
          </linearGradient>
          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffef9" />
            <stop offset="85%" stopColor="#fdf8e6" />
            <stop offset="100%" stopColor="#f7ebc3" />
          </radialGradient>
        </defs>

        {/* Outer Rosette Petals (8-pointed Islamic floral medallion) */}
        <path
          d="M20 1.5 L23.5 5.5 L28.5 4 L29.5 9.2 L34.5 10.5 L33 15.5 L37 19.5 L33.5 23.5 L35 28.5 L29.8 29.5 L28.5 34.5 L23.5 33 L19.5 37 L15.5 33.5 L10.5 35 L9.5 29.8 L4.5 28.5 L6 23.5 L2 19.5 L5.5 15.5 L4 10.5 L9.2 9.5 L10.5 4.5 L15.5 6 Z"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Central Circular Disc with delicate gold borders */}
        <circle cx="20" cy="20" r="14.5" fill="url(#innerGlow)" stroke="url(#goldGradient)" strokeWidth="1.3" />
        
        {/* Inner dotted decorative ring */}
        <circle cx="20" cy="20" r="12" fill="none" stroke="#b48a3c" strokeWidth="0.65" strokeDasharray="1.2,1.2" opacity="0.8" />

        {/* Centered Eastern Arabic Ayah Numeral in bold dark bronze */}
        <text
          x="20"
          y={yPos}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="bold"
          fontFamily="'KFGQPC HAFS Uthmanic Script', 'KFGQPC Uthmanic Script HAFS', 'Uthman Taha Naskh', 'Amiri Quran', 'Amiri', serif"
          fill="#1c1917"
        >
          {arabicNum}
        </text>
      </svg>
    </span>
  );
});

AyahEndMarker.displayName = 'AyahEndMarker';

/**
 * Standard Quran Word Component
 * Renders authentic, pure-black Arabic script with complete cursive ligatures and tashkeel.
 */
export const QuranWord: React.FC<QuranWordProps> = React.memo(({
  word,
  onSelectWord,
  isSelected = false,
  isCompact = false,
  themeBackground,
}) => {
  // If this is an Ayah End Marker (e.g. ۝۱)
  if (word.isAyahMarker) {
    const ayahNum = word.ayah || word.textClean || word.markerText || '';
    return <AyahEndMarker ayahNumber={ayahNum} />;
  }

  const displayText = useMemo(() => cleanQuranWordText(word.text || ''), [word.text]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelectWord(word);
      }}
      style={themeBackground ? { backgroundColor: themeBackground } : undefined}
      className={`inline-flex items-center justify-center px-[2px] sm:px-[3px] py-0 rounded-[2px] cursor-pointer transition-colors duration-150 text-right font-mushaf select-none shrink-0 ${
        isSelected
          ? 'bg-amber-300/80 dark:bg-amber-900/60 ring-2 ring-amber-500 shadow-xs'
          : themeBackground
          ? 'dark:bg-opacity-25 hover:opacity-90'
          : 'hover:bg-amber-500/10 dark:hover:bg-amber-400/15'
      }`}
      title={`${word.textClean} - کلک کریں`}
      dir="rtl"
    >
      <span className="font-mushaf text-[#000000] dark:text-[#f3f4f6] font-normal tracking-normal select-none leading-none">
        {displayText}
      </span>
    </button>
  );
});

QuranWord.displayName = 'QuranWord';
