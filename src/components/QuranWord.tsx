import React from 'react';
import { QuranWordData } from '../types/quran';
import { QuranCharacter } from './QuranCharacter';

interface QuranWordProps {
  word: QuranWordData;
  onSelectWord: (word: QuranWordData) => void;
  isSelected?: boolean;
  isCompact?: boolean;
}

// The 6 non-connecting letters in Arabic (do not connect to following letter on the left)
const NON_CONNECTING_LETTERS = new Set([
  'ا', 'أ', 'إ', 'آ', 'ٱ',
  'د', 'ذ',
  'ر', 'ز',
  'و', 'ؤ',
  'ء'
]);

function isCombiningMark(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0x064B && code <= 0x065F) ||
    code === 0x0670 ||
    (code >= 0x06D6 && code <= 0x06ED) ||
    code === 0x06E4
  );
}

function getLastBaseLetter(text: string): string | null {
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (!isCombiningMark(ch) && ch !== '\u200D') {
      return ch;
    }
  }
  return null;
}

function canConnectLeft(text: string): boolean {
  const lastBase = getLastBaseLetter(text);
  if (!lastBase) return false;
  return !NON_CONNECTING_LETTERS.has(lastBase);
}

export const QuranWord: React.FC<QuranWordProps> = React.memo(({
  word,
  onSelectWord,
  isSelected = false,
  isCompact = false,
}) => {
  // If this is an Ayah End Marker (e.g. ۝۱)
  if (word.isAyahMarker) {
    return (
      <span className="inline-flex items-center justify-center mx-0.5 sm:mx-1 text-gold-600 dark:text-gold-400 font-mushaf text-[0.85em] select-none shrink-0">
        {word.markerText}
      </span>
    );
  }

  // Pre-calculate connected segments while preserving complete Arabic cursive shaping
  const segments = React.useMemo(() => {
    const defaultColor = '#1e293b';

    // Fast path: If word has no character rules or all default, return full authentic text
    if (!word.characters || word.characters.length === 0) {
      return [{ text: word.text, color: defaultColor }];
    }

    const hasColoredRules = word.characters.some(
      (c) => c.color && c.color !== defaultColor
    );
    if (!hasColoredRules) {
      return [{ text: word.text, color: defaultColor }];
    }

    // Group characters into segments while keeping combining marks with their base consonants
    const rawSegments: { text: string; color: string }[] = [];
    let currentSeg: { text: string; color: string } | null = null;

    for (let i = 0; i < word.characters.length; i++) {
      const c = word.characters[i];
      const ch = c.char;
      const color = c.color || defaultColor;

      if (isCombiningMark(ch)) {
        // Combining diacritic ALWAYS attaches to the current consonant segment
        if (currentSeg) {
          currentSeg.text += ch;
        } else {
          currentSeg = { text: ch, color };
          rawSegments.push(currentSeg);
        }
      } else {
        // Base consonant
        if (currentSeg && currentSeg.color === color) {
          currentSeg.text += ch;
        } else {
          currentSeg = { text: ch, color };
          rawSegments.push(currentSeg);
        }
      }
    }

    // If only one segment resulted, no joiners needed
    if (rawSegments.length <= 1) {
      return rawSegments;
    }

    // Apply Zero-Width Joiner (\u200D) between adjacent segments that connect cursively
    const ZWJ = '\u200D';
    const finalSegments: { text: string; color: string }[] = [];

    for (let i = 0; i < rawSegments.length; i++) {
      const seg = rawSegments[i];
      let segText = seg.text;

      const connectsToPrev = i > 0 && canConnectLeft(rawSegments[i - 1].text);
      const connectsToNext = i < rawSegments.length - 1 && canConnectLeft(seg.text);

      if (connectsToPrev && !segText.startsWith(ZWJ)) {
        segText = ZWJ + segText;
      }
      if (connectsToNext && !segText.endsWith(ZWJ)) {
        segText = segText + ZWJ;
      }

      finalSegments.push({
        text: segText,
        color: seg.color,
      });
    }

    return finalSegments;
  }, [word]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelectWord(word);
      }}
      className={`inline-block px-0.5 py-0.5 rounded cursor-pointer transition-all duration-150 active:scale-95 text-right font-mushaf select-none shrink-0 ${
        isSelected
          ? 'bg-gold-200/80 dark:bg-gold-900/60 ring-2 ring-gold-500 shadow-sm'
          : 'hover:bg-emerald-500/15 dark:hover:bg-emerald-400/20'
      }`}
      title={`${word.textClean} - کلک کریں`}
      dir="rtl"
    >
      {segments.length === 1 ? (
        <span style={{ color: segments[0].color }} className="inline font-mushaf">
          {segments[0].text}
        </span>
      ) : (
        segments.map((seg, idx) => (
          <span
            key={idx}
            style={{ color: seg.color }}
            className="inline font-mushaf transition-colors"
          >
            {seg.text}
          </span>
        ))
      )}
    </button>
  );
});

QuranWord.displayName = 'QuranWord';
