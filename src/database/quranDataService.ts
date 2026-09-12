import {
  Bookmark,
  ReadingProgress,
  AppSettings,
  PageStatistics,
  QuranPageData,
  QuranWordData,
  WordOccurrenceResult,
  WordTranslationResult,
  Surah,
  Juz
} from '../types/quran';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';
import { QURAN_WORD_DICTIONARY } from '../data/quranWordDictionary';

const STORAGE_KEYS = {
  BOOKMARKS: 'quran_app_bookmarks_v2',
  READING_PROGRESS: 'quran_app_reading_progress_v2',
  SETTINGS: 'quran_app_settings_v2',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'warm-paper',
  distractionFree: false,
  pageTransition: 'slide',
  showPageStatistics: true, // Default to true so user sees real page stats immediately
  fontSize: 'medium',
  keepScreenOn: false,
};

// In-Memory Caches for Instant 0.1ms Performance
const pagesCache: Record<number, QuranPageData> = {};
let pageStatsCache: Record<number, PageStatistics> | null = null;
let wordOccurrencesCache: Record<string, WordOccurrenceResult> | null = null;
const wordTranslationCache: Record<string, WordTranslationResult> = {};

const getBasePath = (): string => {
  const base = (import.meta as any).env?.BASE_URL || '/';
  return base.endsWith('/') ? base : base + '/';
};

export class QuranDataService {
  /**
   * Determine Surah for a given Mushaf page number (1 to 559)
   */
  static getSurahForPage(pageNumber: number): Surah | null {
    if (pageNumber < 2 || pageNumber > 549) return null;
    return SURAHS_DATA.find((s) => pageNumber >= s.startPage && pageNumber <= s.endPage) || null;
  }

  /**
   * Determine Juz (Para) for a given page number (1 to 559)
   */
  static getJuzForPage(pageNumber: number): Juz | null {
    if (pageNumber < 2 || pageNumber > 549) return null;
    return JUZ_DATA.find((j) => pageNumber >= j.startPage && pageNumber <= j.endPage) || null;
  }

  /**
   * Get reference page scan image path for comparison view
   */
  static getPageImagePath(pageNumber: number): string {
    const clamped = Math.max(1, Math.min(559, pageNumber));
    const pStr = String(clamped).padStart(3, '0');
    return `${getBasePath()}pages/page_${pStr}.jpg`;
  }

  /**
   * Load structured 16-line Page Data with caching
   */
  static async getPageData(pageNumber: number): Promise<QuranPageData> {
    const clamped = Math.max(1, Math.min(559, pageNumber));
    if (pagesCache[clamped]) {
      return pagesCache[clamped];
    }

    const pStr = String(clamped).padStart(3, '0');
    try {
      const res = await fetch(`${getBasePath()}data/pages/page_${pStr}.json`);
      if (!res.ok) throw new Error(`Failed to load page ${clamped}`);
      const data: QuranPageData = await res.json();
      pagesCache[clamped] = data;
      return data;
    } catch (e) {
      console.error(`Error loading page ${clamped}:`, e);
      // Fallback empty page structure
      const emptyPage: QuranPageData = {
        pageNumber: clamped,
        isQuranText: clamped >= 2 && clamped <= 549,
        lines: Array.from({ length: 16 }, (_, i) => ({
          lineNumber: i + 1,
          isHeader: false,
          words: []
        }))
      };
      return emptyPage;
    }
  }

  /**
   * Normalize raw statistics from JSON or fallback into standard PageStatistics
   */
  static normalizePageStatistics(raw: any, pageNumber: number): PageStatistics {
    if (!raw) {
      return {
        pageNumber,
        isQuranText: pageNumber >= 2 && pageNumber <= 549,
        totalWords: 0,
        totalLetters: 0,
        countFatha: 0,
        countKasra: 0,
        countDamma: 0,
        countFathatan: 0,
        countKasratan: 0,
        countDammatan: 0,
        countSukoon: 0,
        countShaddah: 0,
        countMaddah: 0,
        countStandingFatha: 0,
        countStandingKasra: 0,
        countInvertedDamma: 0,
        countHeavyLetters: 0,
        countQalqalah: 0,
        isCalculated: false
      };
    }

    const dCounts = raw.diacriticsCounts || {};
    const tCounts = raw.tajweedCounts || {};

    return {
      pageNumber: raw.pageNumber ?? pageNumber,
      isQuranText: raw.isQuranText ?? (pageNumber >= 2 && pageNumber <= 549),
      totalWords: raw.totalWords ?? raw.wordCount ?? 0,
      totalLetters: raw.totalLetters ?? raw.letterCount ?? 0,
      countFatha: raw.countFatha ?? dCounts.fatha ?? 0,
      countKasra: raw.countKasra ?? dCounts.kasra ?? 0,
      countDamma: raw.countDamma ?? dCounts.damma ?? 0,
      countFathatan: raw.countFathatan ?? dCounts.fathatan ?? 0,
      countKasratan: raw.countKasratan ?? dCounts.kasratan ?? 0,
      countDammatan: raw.countDammatan ?? dCounts.dammatan ?? 0,
      countSukoon: raw.countSukoon ?? dCounts.sukoon ?? 0,
      countShaddah: raw.countShaddah ?? dCounts.shaddah ?? 0,
      countMaddah: raw.countMaddah ?? dCounts.maddah ?? tCounts.madd ?? 0,
      countStandingFatha: raw.countStandingFatha ?? dCounts.standingFatha ?? 0,
      countStandingKasra: raw.countStandingKasra ?? dCounts.standingKasra ?? 0,
      countInvertedDamma: raw.countInvertedDamma ?? dCounts.invertedDamma ?? 0,
      countHeavyLetters: raw.countHeavyLetters ?? dCounts.heavyLetters ?? tCounts.tafkhim ?? 0,
      countQalqalah: raw.countQalqalah ?? dCounts.qalqalah ?? tCounts.qalqalah ?? 0,
      isCalculated: true
    };
  }

  /**
   * Dynamically calculate real statistics directly from 16-line page data
   */
  static calculatePageStatisticsFromData(pageData: QuranPageData): PageStatistics {
    const stats: PageStatistics = {
      pageNumber: pageData.pageNumber,
      isQuranText: pageData.isQuranText,
      totalWords: 0,
      totalLetters: 0,
      countFatha: 0,
      countKasra: 0,
      countDamma: 0,
      countFathatan: 0,
      countKasratan: 0,
      countDammatan: 0,
      countSukoon: 0,
      countShaddah: 0,
      countMaddah: 0,
      countStandingFatha: 0,
      countStandingKasra: 0,
      countInvertedDamma: 0,
      countHeavyLetters: 0,
      countQalqalah: 0,
      isCalculated: true
    };

    if (!pageData.lines || !Array.isArray(pageData.lines)) return stats;

    for (const line of pageData.lines) {
      if (line.isHeader || !line.words) continue;
      for (const w of line.words) {
        if (w.isAyahMarker) continue;
        stats.totalWords++;
        if (w.characters && Array.isArray(w.characters)) {
          stats.totalLetters += w.characters.length;
        }
        if (w.diacritics) {
          stats.countFatha += w.diacritics.fatha || 0;
          stats.countKasra += w.diacritics.kasra || 0;
          stats.countDamma += w.diacritics.damma || 0;
          stats.countFathatan += w.diacritics.fathatan || 0;
          stats.countKasratan += w.diacritics.kasratan || 0;
          stats.countDammatan += w.diacritics.dammatan || 0;
          stats.countSukoon += w.diacritics.sukoon || 0;
          stats.countShaddah += w.diacritics.shaddah || 0;
          stats.countMaddah += w.diacritics.maddah || 0;
          stats.countStandingFatha += w.diacritics.standingFatha || 0;
          stats.countStandingKasra += w.diacritics.standingKasra || 0;
          stats.countInvertedDamma += w.diacritics.invertedDamma || 0;
          stats.countHeavyLetters += w.diacritics.heavyLetters || 0;
          stats.countQalqalah += w.diacritics.qalqalah || 0;
        }
      }
    }

    return stats;
  }

  /**
   * Load real, calculated Page Statistics for a page
   */
  static async getPageStatistics(pageNumber: number): Promise<PageStatistics> {
    const clamped = Math.max(1, Math.min(559, pageNumber));

    if (!pageStatsCache) {
      try {
        const res = await fetch(`${getBasePath()}data/pageStatistics.json`);
        if (res.ok) {
          const rawData = await res.json();
          pageStatsCache = {};
          for (const [key, raw] of Object.entries(rawData as Record<string, any>)) {
            const p = Number(key);
            pageStatsCache[p] = QuranDataService.normalizePageStatistics(raw, p);
          }
        }
      } catch (e) {
        console.error('Failed to load page statistics:', e);
      }
    }

    if (pageStatsCache && pageStatsCache[clamped] && pageStatsCache[clamped].totalWords > 0) {
      return pageStatsCache[clamped];
    }

    // Dynamic Fallback: calculate directly from page data if text page
    if (clamped >= 2 && clamped <= 549) {
      try {
        const pageData = await QuranDataService.getPageData(clamped);
        const calculated = QuranDataService.calculatePageStatisticsFromData(pageData);
        if (calculated.totalWords > 0) {
          if (!pageStatsCache) pageStatsCache = {};
          pageStatsCache[clamped] = calculated;
          return calculated;
        }
      } catch (e) {
        console.error(`Failed to calculate fallback statistics for page ${clamped}:`, e);
      }
    }

    if (pageStatsCache && pageStatsCache[clamped]) {
      return pageStatsCache[clamped];
    }

    return QuranDataService.normalizePageStatistics(null, clamped);
  }

  /**
   * Dynamically query Quran-Wide Word Occurrences for any clicked word
   */
  static async getWordOccurrences(cleanWord: string): Promise<WordOccurrenceResult | null> {
    if (!cleanWord) return null;

    if (!wordOccurrencesCache) {
      try {
        const res = await fetch(`${getBasePath()}data/wordOccurrences.json`);
        if (res.ok) {
          wordOccurrencesCache = await res.json();
        }
      } catch (e) {
        console.error('Failed to load word occurrences index:', e);
      }
    }

    if (wordOccurrencesCache && wordOccurrencesCache[cleanWord]) {
      return wordOccurrencesCache[cleanWord];
    }

    return null;
  }

  /**
   * Get Bookmarks from Local Storage
   */
  static getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load bookmarks', e);
      return [];
    }
  }

  /**
   * Toggle bookmark for a page
   */
  static toggleBookmark(pageNumber: number): boolean {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.pageNumber === pageNumber);

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return false;
    } else {
      const surah = this.getSurahForPage(pageNumber);
      const juz = this.getJuzForPage(pageNumber);
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}`,
        pageNumber,
        surahNumber: surah?.number,
        surahName: surah?.nameUrdu || surah?.nameArabic || `صفحہ ${pageNumber}`,
        juzNumber: juz?.number,
        title: `صفحہ ${pageNumber} - ${surah?.nameUrdu || ''}`,
        createdAt: new Date().toISOString(),
      };
      bookmarks.unshift(newBookmark);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return true;
    }
  }

  /**
   * Check if a page is bookmarked
   */
  static isPageBookmarked(pageNumber: number): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some((b) => b.pageNumber === pageNumber);
  }

  /**
   * Delete specific bookmark
   */
  static deleteBookmark(bookmarkId: string) {
    const bookmarks = this.getBookmarks().filter((b) => b.id !== bookmarkId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  /**
   * Get Reading Progress
   */
  static getReadingProgress(): ReadingProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load progress', e);
    }
    return {
      lastPageNumber: 2,
      lastSurahNumber: 1,
      lastJuzNumber: 1,
      lastReadTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Save Reading Progress
   */
  static saveReadingProgress(pageNumber: number) {
    const surah = this.getSurahForPage(pageNumber);
    const juz = this.getJuzForPage(pageNumber);
    const progress: ReadingProgress = {
      lastPageNumber: pageNumber,
      lastSurahNumber: surah?.number || 1,
      lastJuzNumber: juz?.number || 1,
      lastReadTimestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }

  /**
   * Get App Settings
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save App Settings
   */
  static saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  /**
   * Get authentic Urdu and English translation for a specific Quranic word
   * Uses multi-tier strategy: In-memory cache -> LocalStorage -> Offline Word Dictionary -> Quran.com WBW API
   */
  static async getWordTranslation(word: QuranWordData): Promise<WordTranslationResult> {
    if (!word) {
      return { urdu: 'معنی دستیاب نہیں', english: 'No meaning available' };
    }

    const cacheKey = `${word.surah || 0}_${word.ayah || 0}_${word.position || 0}`;
    if (wordTranslationCache[cacheKey]) {
      return wordTranslationCache[cacheKey];
    }

    // 1. Check LocalStorage for cached verse words
    if (word.surah && word.ayah) {
      try {
        const stored = localStorage.getItem(`quran_wbw_${word.surah}_${word.ayah}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[word.position]) {
            wordTranslationCache[cacheKey] = parsed[word.position];
            return parsed[word.position];
          }
        }
      } catch (e) {
        // localStorage read error ignored
      }
    }

function cleanArabicForMatch(text: string): string {
  return (text || '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u06DF-\u06E4\u0640\u200C\u200D\u200E\u200F\uFEFF]/g, '')
    .replace(/[ٱإأآء]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .trim();
}

    // 2. Check Offline Dictionary
    const cleanWord = cleanArabicForMatch(word.textClean || word.text || '');
    const dictMatch = QURAN_WORD_DICTIONARY[cleanWord] || QURAN_WORD_DICTIONARY[word.textClean || ''];
    const fallback: WordTranslationResult | null = dictMatch
      ? {
          urdu: dictMatch.urdu,
          english: dictMatch.english,
          transliteration: dictMatch.transliteration,
        }
      : null;

    // 3. Try to fetch contextual word-by-word translation from Quran.com API
    if (word.surah && word.ayah) {
      try {
        const [urRes, enRes] = await Promise.all([
          fetch(
            `https://api.quran.com/api/v4/verses/by_key/${word.surah}:${word.ayah}?language=ur&words=true&word_fields=text_uthmani,translation`
          ),
          fetch(
            `https://api.quran.com/api/v4/verses/by_key/${word.surah}:${word.ayah}?language=en&words=true&word_fields=text_uthmani,translation`
          ),
        ]);

        if (urRes.ok && enRes.ok) {
          const [urData, enData] = await Promise.all([urRes.json(), enRes.json()]);
          const urWords = urData?.verse?.words || [];
          const enWords = enData?.verse?.words || [];

          let matchedItem: WordTranslationResult | null = null;
          let bestDistance = Infinity;

          for (let i = 0; i < urWords.length; i++) {
            const uw = urWords[i];
            const ew = enWords[i] || {};
            const pos = uw.position || i + 1;
            const apiClean = cleanArabicForMatch(uw.text_uthmani || uw.text || '');

            const item: WordTranslationResult = {
              urdu: uw.translation?.text || fallback?.urdu || '—',
              english: ew.translation?.text || fallback?.english || '—',
              transliteration: ew.transliteration?.text || undefined,
            };

            // Store in cache
            wordTranslationCache[`${word.surah}_${word.ayah}_${pos}`] = item;

            // Clean text match
            if (apiClean && cleanWord && apiClean === cleanWord) {
              const dist = Math.abs(pos - (word.position || 1));
              if (dist < bestDistance) {
                bestDistance = dist;
                matchedItem = item;
              }
            }
          }

          // Fallback to position match if no direct text match
          if (!matchedItem && urWords[word.position - 1]) {
            const uw = urWords[word.position - 1];
            const ew = enWords[word.position - 1] || {};
            matchedItem = {
              urdu: uw.translation?.text || fallback?.urdu || '—',
              english: ew.translation?.text || fallback?.english || '—',
              transliteration: ew.transliteration?.text || undefined,
            };
          }

          if (matchedItem) {
            wordTranslationCache[cacheKey] = matchedItem;
            return matchedItem;
          }
        }
      } catch (err) {
        console.warn('Network translation fetch failed, using dictionary fallback:', err);
      }
    }

    if (fallback) {
      wordTranslationCache[cacheKey] = fallback;
      return fallback;
    }

    // Default if not in dictionary and network failed
    return {
      urdu: 'معنی برائے کلمہ قرآنی',
      english: 'Quranic word translation',
    };
  }
}

