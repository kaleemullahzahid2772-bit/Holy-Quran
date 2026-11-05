export interface QuranCharacterData {
  char: string;
  rules: string[];
  color: string; // e.g. '#16a34a' (green), '#0284c7' (blue), '#e11d48' (pink), '#ea580c' (orange), '#1e293b' (normal)
}

export type ThematicSubjectId =
  | 'faith_tawheed'       // العقيدة ودلائل التوحيد والقدرة والإيمان
  | 'prophets_stories'    // قصص الأنبياء والرسل وسير الأولين
  | 'rulings_shariah'     // الأحكام والتشريعات والفرائض والعبادات
  | 'judgement_day'       // أهوال القيامة والبعث والحساب والجزاء
  | 'believers_paradise'  // صفات المؤمنين وجزاؤهم ونعيم الجنة والرحمة
  | 'hypocrites_hellfire' // صفات المنافقين والكافرين ومصيرهم والنار
  | 'wisdom_morals';      // الأمثال والحكم والآداب والمواعظ العامة

export interface ThematicSubject {
  id: ThematicSubjectId;
  nameArabic: string;
  nameUrdu: string;
  nameEnglish: string;
  descriptionUrdu: string;
  colorLight: string;       // Soft pastel background
  colorBorderLight: string;
  colorDark: string;        // Dark mode background
  colorBorderDark: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export interface MarginalWordMeaning {
  word: string;
  meaningArabic: string;
  meaningUrdu: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface PageSubjectRange {
  subjectId: ThematicSubjectId;
  titleArabic: string;
  titleUrdu: string;
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
}

export interface PageThematicData {
  pageNumber: number;
  subjects: PageSubjectRange[];
  vocabulary: MarginalWordMeaning[];
}

export interface QuranWordData {
  id: number;
  surah: number;
  surahName: string;
  ayah: number;
  position: number;
  text: string;
  textClean: string;
  characters: QuranCharacterData[];
  rules: string[];
  tajweedSummary: string;
  diacritics: {
    letters: number;
    fatha: number;
    kasra: number;
    damma: number;
    fathatan: number;
    kasratan: number;
    dammatan: number;
    sukoon: number;
    shaddah: number;
    maddah: number;
    standingFatha: number;
    standingKasra: number;
    invertedDamma: number;
    heavyLetters: number;
    qalqalah: number;
  };
  page?: number;
  line?: number;
  isAyahMarker?: boolean;
  markerText?: string;
  subjectId?: ThematicSubjectId;
  subjectTitleArabic?: string;
  subjectTitleUrdu?: string;
}

export interface QuranLineData {
  lineNumber: number;
  isHeader: boolean;
  headerType?: 'surah_title' | 'bismillah' | 'dua_khatam';
  surahNumber?: number;
  surahName?: string;
  totalAyahs?: number;
  revelationType?: string;
  includeBismillah?: boolean;
  subjectId?: ThematicSubjectId;
  words: QuranWordData[];
}

export interface QuranPageData {
  pageNumber: number;
  isQuranText: boolean;
  lines: QuranLineData[];
}

export interface PageStatistics {
  pageNumber: number;
  isQuranText: boolean;
  totalWords: number;
  totalLetters: number;
  countFatha: number;
  countKasra: number;
  countDamma: number;
  countFathatan: number;
  countKasratan: number;
  countDammatan: number;
  countSukoon: number;
  countShaddah: number;
  countMaddah: number;
  countStandingFatha: number;
  countStandingKasra: number;
  countInvertedDamma: number;
  countHeavyLetters: number;
  countQalqalah: number;
  isCalculated: boolean;
}

export interface WordOccurrenceInstance {
  surah: number;
  surahName: string;
  ayah: number;
  page: number;
  line: number;
  position: number;
}

export interface WordOccurrenceResult {
  cleanWord: string;
  sampleText: string;
  totalCount: number;
  occurrences: WordOccurrenceInstance[];
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  revelationType: 'Makki' | 'Madani';
  totalAyahs: number;
  startPage: number;
  endPage: number;
}

export interface Juz {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  startPage: number;
  endPage: number;
}

export interface Bookmark {
  id: string;
  pageNumber: number;
  surahNumber?: number;
  surahName?: string;
  juzNumber?: number;
  title?: string;
  createdAt: string;
}

export interface ReadingProgress {
  lastPageNumber: number;
  lastSurahNumber: number;
  lastJuzNumber: number;
  lastReadTimestamp: string;
}

export interface TajweedRule {
  nameUrdu: string;
  nameEnglish: string;
  colorName: string;
  colorHex: string;
  descriptionUrdu: string;
  descriptionEnglish: string;
  examples: string[];
}

export interface AppSettings {
  theme: 'light' | 'warm-paper' | 'dark' | 'emerald';
  distractionFree: boolean;
  pageTransition: 'slide' | 'fade' | 'instant';
  showPageStatistics: boolean;
  fontSize: 'small' | 'medium' | 'large';
  keepScreenOn: boolean;
  showThematicColors: boolean;
  showTajweedColors: boolean;
  showMarginalVocabulary: boolean;
}

export interface WordTranslationResult {
  urdu: string;
  english: string;
  transliteration?: string;
}

