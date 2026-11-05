import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';
import { QURAN_LETTERS_STATISTICS, QuranLetterStatistic } from '../data/quranStatisticsData';
import { Surah, Juz, WordOccurrenceResult, WordOccurrenceInstance } from '../types/quran';

export interface LetterSearchResult {
  letter: string;
  nameUrdu: string;
  nameArabic: string;
  officialCount: number;
  formattedCount: string;
  relation: string;
  percentage?: string;
  wordsWithLetterCount: number;
  totalOccurrencesInWords: number;
  topWords: {
    cleanWord: string;
    sampleText: string;
    count: number;
    occurrences: WordOccurrenceInstance[];
  }[];
}

export interface QuranSearchResult {
  query: string;
  normalizedQuery: string;
  isSingleLetter: boolean;
  letterResult: LetterSearchResult | null;
  matchedSurahs: Surah[];
  matchedJuz: Juz[];
  matchedWords: {
    cleanWord: string;
    sampleText: string;
    totalCount: number;
    occurrences: WordOccurrenceInstance[];
  }[];
  pageJump: number | null;
}

const getBasePath = (): string => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  return base.endsWith('/') ? base : base + '/';
};

// Cache for word occurrences
let wordOccurrencesCache: Record<string, WordOccurrenceResult> | null = null;
let isLoadingIndex = false;
let loadPromise: Promise<Record<string, WordOccurrenceResult> | null> | null = null;

/**
 * Normalizes Arabic text for flexible search:
 * - Removes diacritics (harakat, tatweel, etc.)
 * - Unifies variants of alef (أ, إ, آ, ٱ -> ا)
 * - Normalizes teh marbuta (ة -> ه)
 * - Normalizes yeh (ى -> ي) and kaf variants
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u0671\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ك/g, 'ک')
    .replace(/ي/g, 'ی')
    .toLowerCase()
    .trim();
}

/**
 * Strips tashkeel/harakat only (keeps base Arabic letters as-is)
 */
export function stripHarakat(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u0671\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g, '')
    .trim();
}

/**
 * Standardize single Arabic letter for lookup
 */
export function standardizeLetter(char: string): string {
  const stripped = stripHarakat(char);
  if (!stripped) return '';
  const first = stripped[0];
  if (/[أإآٱ]/.test(first)) return 'ا';
  if (first === 'ک') return 'ك';
  if (first === 'ی') return 'ي';
  return first;
}

/**
 * Ensure the full word occurrence index is loaded
 */
export async function loadWordOccurrences(): Promise<Record<string, WordOccurrenceResult>> {
  if (wordOccurrencesCache) return wordOccurrencesCache;
  if (isLoadingIndex && loadPromise) return (await loadPromise) || {};

  isLoadingIndex = true;
  loadPromise = (async () => {
    try {
      const res = await fetch(`${getBasePath()}data/wordOccurrences.json`);
      if (res.ok) {
        wordOccurrencesCache = await res.json();
        return wordOccurrencesCache;
      }
    } catch (err) {
      console.error('Failed to load word occurrences:', err);
    } finally {
      isLoadingIndex = false;
    }
    return {};
  })();

  const result = await loadPromise;
  return result || {};
}

/**
 * Search all Quranic occurrences of a single Arabic letter
 */
export async function searchArabicLetter(letterChar: string): Promise<LetterSearchResult | null> {
  const normChar = standardizeLetter(letterChar);
  if (!normChar) return null;

  // Find official stats entry
  const stat = QURAN_LETTERS_STATISTICS.find(
    (s) =>
      standardizeLetter(s.letter) === normChar ||
      s.letter === letterChar ||
      s.nameUrdu.includes(letterChar) ||
      s.nameArabic.includes(letterChar)
  );

  const wordIndex = await loadWordOccurrences();
  const matchedWords: LetterSearchResult['topWords'] = [];
  let totalOccurrencesInWords = 0;

  // Search words that contain this letter
  for (const [cleanWord, data] of Object.entries(wordIndex)) {
    // Count how many times letter appears in this word
    let countInWord = 0;
    for (const ch of cleanWord) {
      if (standardizeLetter(ch) === normChar || ch === normChar) {
        countInWord++;
      }
    }

    if (countInWord > 0) {
      totalOccurrencesInWords += countInWord * data.totalCount;
      matchedWords.push({
        cleanWord,
        sampleText: data.sampleText,
        count: data.totalCount,
        occurrences: data.occurrences,
      });
    }
  }

  // Sort matched words by total frequency descending
  matchedWords.sort((a, b) => b.count - a.count);

  return {
    letter: stat?.letter || normChar,
    nameUrdu: stat?.nameUrdu || `حرف ${normChar}`,
    nameArabic: stat?.nameArabic || normChar,
    officialCount: stat?.count || totalOccurrencesInWords,
    formattedCount: stat?.formattedCount || totalOccurrencesInWords.toLocaleString(),
    relation: stat?.relation || '~',
    percentage: stat?.percentage,
    wordsWithLetterCount: matchedWords.length,
    totalOccurrencesInWords,
    topWords: matchedWords,
  };
}

/**
 * Universal Comprehensive Quran Search
 * Handles:
 * 1. Single Arabic letter lookup (detailed counts, frequency, every word & occurrence)
 * 2. Word search (with & without harakat, prefix matching, occurrence jumping)
 * 3. Surah search (Arabic, Urdu, English, number)
 * 4. Juz/Para search (Arabic, Urdu, English, number)
 * 5. Page number direct jump (1-604)
 */
export async function searchQuran(query: string): Promise<QuranSearchResult> {
  const rawTrimmed = query.trim();
  const normalizedQuery = normalizeArabicText(rawTrimmed);
  const cleanQuery = stripHarakat(rawTrimmed);

  const result: QuranSearchResult = {
    query: rawTrimmed,
    normalizedQuery,
    isSingleLetter: false,
    letterResult: null,
    matchedSurahs: [],
    matchedJuz: [],
    matchedWords: [],
    pageJump: null,
  };

  if (!rawTrimmed) return result;

  // 1. Direct Page Jump check
  const num = parseInt(rawTrimmed, 10);
  if (!isNaN(num) && num >= 1 && num <= 604) {
    result.pageJump = num;
  }

  // 2. Surahs Search
  const lowerQuery = rawTrimmed.toLowerCase();
  result.matchedSurahs = SURAHS_DATA.filter((s) => {
    return (
      normalizeArabicText(s.nameArabic).includes(normalizedQuery) ||
      s.nameArabic.includes(cleanQuery) ||
      s.nameUrdu.includes(rawTrimmed) ||
      s.nameEnglish.toLowerCase().includes(lowerQuery) ||
      String(s.number) === rawTrimmed ||
      String(s.startPage) === rawTrimmed
    );
  });

  // 3. Juz Search
  result.matchedJuz = JUZ_DATA.filter((j) => {
    return (
      normalizeArabicText(j.nameArabic).includes(normalizedQuery) ||
      j.nameArabic.includes(cleanQuery) ||
      j.nameUrdu.includes(rawTrimmed) ||
      j.nameEnglish.toLowerCase().includes(lowerQuery) ||
      String(j.number) === rawTrimmed
    );
  });

  // 4. Single Letter Search Check
  // If query is a single Arabic letter (length 1 after stripping diacritics)
  const isOneChar = cleanQuery.length === 1 && /[\u0600-\u06FF]/.test(cleanQuery);
  const letterStat = QURAN_LETTERS_STATISTICS.find(
    (l) => l.letter === cleanQuery || l.nameUrdu === rawTrimmed || l.nameArabic === rawTrimmed
  );

  if (isOneChar || letterStat) {
    result.isSingleLetter = true;
    const targetChar = isOneChar ? cleanQuery : (letterStat?.letter || cleanQuery);
    result.letterResult = await searchArabicLetter(targetChar);
  }

  // 5. Word / Phrase / Keyword Search across full Quran Index
  const wordIndex = await loadWordOccurrences();
  const matchedWordsList: QuranSearchResult['matchedWords'] = [];

  // Match clean words
  for (const [cleanWord, data] of Object.entries(wordIndex)) {
    const normClean = normalizeArabicText(cleanWord);
    
    // Direct or normalized match
    const isDirectMatch = cleanWord === cleanQuery;
    const isPrefixMatch = cleanWord.startsWith(cleanQuery);
    const isContainsMatch = cleanWord.includes(cleanQuery);
    const isNormMatch = normClean.includes(normalizedQuery);

    if (isDirectMatch || isPrefixMatch || isContainsMatch || isNormMatch) {
      matchedWordsList.push({
        cleanWord,
        sampleText: data.sampleText,
        totalCount: data.totalCount,
        occurrences: data.occurrences,
      });
    }
  }

  // Sort matching words: exact match first, then highest frequency
  matchedWordsList.sort((a, b) => {
    const aExact = a.cleanWord === cleanQuery || normalizeArabicText(a.cleanWord) === normalizedQuery;
    const bExact = b.cleanWord === cleanQuery || normalizeArabicText(b.cleanWord) === normalizedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return b.totalCount - a.totalCount;
  });

  result.matchedWords = matchedWordsList;

  return result;
}
