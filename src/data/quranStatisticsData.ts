export interface QuranLetterStatistic {
  id: number;
  letter: string;
  nameUrdu: string;
  nameArabic: string;
  count: number;
  relation: '~' | '>' | '=';
  formattedCount: string;
  percentage?: string;
  description?: string;
}

export interface QuranDiacriticStatistic {
  id: number;
  nameUrdu: string;
  nameArabic: string;
  symbol: string;
  sample: string;
  count: number;
  formattedCount: string;
  description: string;
  colorClass: string;
}

export interface QuranGeneralStatistic {
  labelUrdu: string;
  labelEng: string;
  value: string | number;
  badge?: string;
}

// 1. حروف کی تعداد (Letter Frequencies across the Holy Quran)
export const QURAN_LETTERS_STATISTICS: QuranLetterStatistic[] = [
  { id: 1, letter: 'ا', nameUrdu: 'الف', nameArabic: 'أَلِف', count: 48872, relation: '~', formattedCount: '48,872', percentage: '15.1%' },
  { id: 2, letter: 'ب', nameUrdu: 'با', nameArabic: 'بَاء', count: 11228, relation: '~', formattedCount: '11,228', percentage: '3.5%' },
  { id: 3, letter: 'ت', nameUrdu: 'تا', nameArabic: 'تَاء', count: 1199, relation: '~', formattedCount: '1,199', percentage: '0.4%' },
  { id: 4, letter: 'ث', nameUrdu: 'ثا', nameArabic: 'ثَاء', count: 1276, relation: '~', formattedCount: '1,276', percentage: '0.4%' },
  { id: 5, letter: 'ج', nameUrdu: 'جیم', nameArabic: 'جِيم', count: 3273, relation: '>', formattedCount: '3,273', percentage: '1.0%' },
  { id: 6, letter: 'ح', nameUrdu: 'حا', nameArabic: 'حَاء', count: 973, relation: '~', formattedCount: '973', percentage: '0.3%' },
  { id: 7, letter: 'خ', nameUrdu: 'خا', nameArabic: 'خَاء', count: 2416, relation: '~', formattedCount: '2,416', percentage: '0.7%' },
  { id: 8, letter: 'د', nameUrdu: 'دال', nameArabic: 'دَال', count: 5642, relation: '>', formattedCount: '5,642', percentage: '1.7%' },
  { id: 9, letter: 'ذ', nameUrdu: 'ذال', nameArabic: 'ذَال', count: 4697, relation: '>', formattedCount: '4,697', percentage: '1.5%' },
  { id: 10, letter: 'ر', nameUrdu: 'را', nameArabic: 'رَاء', count: 11793, relation: '~', formattedCount: '11,793', percentage: '3.6%' },
  { id: 11, letter: 'ز', nameUrdu: 'زا', nameArabic: 'زَاي', count: 1590, relation: '~', formattedCount: '1,590', percentage: '0.5%' },
  { id: 12, letter: 'س', nameUrdu: 'سین', nameArabic: 'سِين', count: 5891, relation: '>', formattedCount: '5,891', percentage: '1.8%' },
  { id: 13, letter: 'ش', nameUrdu: 'شین', nameArabic: 'شِين', count: 2253, relation: '~', formattedCount: '2,253', percentage: '0.7%' },
  { id: 14, letter: 'ص', nameUrdu: 'صاد', nameArabic: 'صَاد', count: 2013, relation: '~', formattedCount: '2,013', percentage: '0.6%' },
  { id: 15, letter: 'ض', nameUrdu: 'ضاد', nameArabic: 'ضَاد', count: 1607, relation: '~', formattedCount: '1,607', percentage: '0.5%' },
  { id: 16, letter: 'ط', nameUrdu: 'طا', nameArabic: 'طَاء', count: 1274, relation: '~', formattedCount: '1,274', percentage: '0.4%' },
  { id: 17, letter: 'ظ', nameUrdu: 'ظا', nameArabic: 'ظَاء', count: 842, relation: '~', formattedCount: '842', percentage: '0.3%' },
  { id: 18, letter: 'ع', nameUrdu: 'عین', nameArabic: 'عَيْن', count: 92200, relation: '>', formattedCount: '92,200', percentage: '28.5%' },
  { id: 19, letter: 'غ', nameUrdu: 'غین', nameArabic: 'غَيْن', count: 2208, relation: '~', formattedCount: '2,208', percentage: '0.7%' },
  { id: 20, letter: 'ف', nameUrdu: 'فا', nameArabic: 'فَاء', count: 8499, relation: '>', formattedCount: '8,499', percentage: '2.6%' },
  { id: 21, letter: 'ق', nameUrdu: 'قاف', nameArabic: 'قَاف', count: 6813, relation: '~', formattedCount: '6,813', percentage: '2.1%' },
  { id: 22, letter: 'ک', nameUrdu: 'کاف', nameArabic: 'كَاف', count: 9522, relation: '~', formattedCount: '9,522', percentage: '2.9%' },
  { id: 23, letter: 'ل', nameUrdu: 'لام', nameArabic: 'لَام', count: 3432, relation: '~', formattedCount: '3,432', percentage: '1.1%' },
  { id: 24, letter: 'م', nameUrdu: 'میم', nameArabic: 'مِيم', count: 26535, relation: '~', formattedCount: '26,535', percentage: '8.2%' },
  { id: 25, letter: 'ن', nameUrdu: 'نون', nameArabic: 'نُون', count: 26560, relation: '~', formattedCount: '26,560', percentage: '8.2%' },
  { id: 26, letter: 'و', nameUrdu: 'واؤ', nameArabic: 'وَاو', count: 2556, relation: '>', formattedCount: '2,556', percentage: '0.8%' },
  { id: 27, letter: 'ہ', nameUrdu: 'ہا', nameArabic: 'هَاء', count: 1907, relation: '~', formattedCount: '1,907', percentage: '0.6%' },
  { id: 28, letter: 'لا', nameUrdu: 'لام الف', nameArabic: 'لَا', count: 3720, relation: '~', formattedCount: '3,720', percentage: '1.2%' },
  { id: 29, letter: 'ء', nameUrdu: 'ہمزہ', nameArabic: 'هَمْزَة', count: 4115, relation: '~', formattedCount: '4,115', percentage: '1.3%' },
  { id: 30, letter: 'ی', nameUrdu: 'یا', nameArabic: 'يَاء', count: 25919, relation: '>', formattedCount: '25,919', percentage: '8.0%' }
];

// 2. کل حرکات و اعراب و علامات (Diacritics & Dots across the Holy Quran)
export const QURAN_DIACRITICS_STATISTICS: QuranDiacriticStatistic[] = [
  {
    id: 1,
    nameUrdu: 'فتحات (زبر)',
    nameArabic: 'الفَتْحَات',
    symbol: 'َ',
    sample: 'بَ',
    count: 53243,
    formattedCount: '53,243',
    description: 'حرف کے اوپر لگنے والی زبر (Fatha)',
    colorClass: 'from-amber-500 to-amber-600'
  },
  {
    id: 2,
    nameUrdu: 'کسرات (زیر)',
    nameArabic: 'الكَسْرَات',
    symbol: 'ِ',
    sample: 'بِ',
    count: 39582,
    formattedCount: '39,582',
    description: 'حرف کے نیچے لگنے والی زیر (Kasra)',
    colorClass: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 3,
    nameUrdu: 'ضمات (پیش)',
    nameArabic: 'الضَّمَّات',
    symbol: 'ُ',
    sample: 'بُ',
    count: 8804,
    formattedCount: '8,804',
    description: 'حرف کے اوپر لگنے والی پیش (Damma)',
    colorClass: 'from-blue-500 to-blue-600'
  },
  {
    id: 4,
    nameUrdu: 'مدّات (مد)',
    nameArabic: 'المَدَّات',
    symbol: 'ٓ',
    sample: 'آ / لٓمٓ',
    count: 1771,
    formattedCount: '1,771',
    description: 'کھینچ کر پڑھے جانے والے حروف پر مد (Madd)',
    colorClass: 'from-purple-500 to-purple-600'
  },
  {
    id: 5,
    nameUrdu: 'تشادید (شد / تشدید)',
    nameArabic: 'التَّشَادِيد',
    symbol: 'ّ',
    sample: 'بّ',
    count: 1243,
    formattedCount: '1,243',
    description: 'حرف کو دو بار پڑھنے والی علامت (Shaddah)',
    colorClass: 'from-rose-500 to-rose-600'
  },
  {
    id: 6,
    nameUrdu: 'نقاط (نقطے)',
    nameArabic: 'النِّقَاط',
    symbol: '∴',
    sample: '∴',
    count: 105881,
    formattedCount: '1,05,881',
    description: 'قرآن کریم کے منقوط حروف کے کل نقاط (Dots)',
    colorClass: 'from-teal-500 to-teal-600'
  }
];

// 3. عمومی قرآنی شماریات (Grand Quran Overview Facts)
export const QURAN_GENERAL_STATISTICS: QuranGeneralStatistic[] = [
  { labelUrdu: 'کل سورتیں', labelEng: 'Total Surahs', value: '114', badge: 'مکی 86 • مدنی 28' },
  { labelUrdu: 'کل پارے (اجزاء)', labelEng: 'Total Paras (Juz)', value: '30', badge: '۳۰ برابر اجزاء' },
  { labelUrdu: 'کل رکوعات', labelEng: 'Total Ruku', value: '558', badge: '۵۵۸ رکوع' },
  { labelUrdu: 'کل منازل', labelEng: 'Total Manzils', value: '7', badge: '۷ منازل' },
  { labelUrdu: 'کل آیاتِ مبارکہ', labelEng: 'Total Verses', value: '6,236', badge: 'کوئی 6,666 روایات' },
  { labelUrdu: 'کل کلمات / الفاظ', labelEng: 'Total Words', value: '~ 77,430', badge: 'قرآنی کلمات' },
  { labelUrdu: 'کل سجدہ تلاوت', labelEng: 'Total Sajdahs', value: '14', badge: '۱۴ سجدے' },
  { labelUrdu: 'کل صفحات (۱۶ سطری)', labelEng: 'Mushaf Pages', value: '559', badge: '۱۶ سطری مصحف' },
];
