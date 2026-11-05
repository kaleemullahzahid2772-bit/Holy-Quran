import React from 'react';
import { BookOpen, Compass, BarChart2, Palette, Sparkles, ChevronRight, Bookmark as BookmarkIcon, Search, Eye } from 'lucide-react';
import { ReadingProgress, Surah, Juz, Bookmark } from '../types/quran';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';
import { QuranDataService } from '../database/quranDataService';

interface HomeScreenProps {
  readingProgress: ReadingProgress;
  onOpenQuran: (page?: number) => void;
  onOpenNavigation: (tab: 'surahs' | 'juz' | 'pages' | 'themes') => void;
  onOpenTajweedLegend: () => void;
  onOpenBookmarks?: () => void;
  onOpenQuranStatistics?: () => void;
  onOpenSearch?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  readingProgress,
  onOpenQuran,
  onOpenNavigation,
  onOpenTajweedLegend,
  onOpenBookmarks,
  onOpenQuranStatistics,
  onOpenSearch,
}) => {
  const pageNum = readingProgress?.lastPageNumber || 1;

  // Safe lookup of current Surah & Juz based on lastPageNumber
  const lastSurah: Surah = SURAHS_DATA.find(
    (s) => pageNum >= s.startPage && pageNum <= s.endPage
  ) || SURAHS_DATA[0] || { nameArabic: 'الفَاتِحَة', nameUrdu: 'سورۃ الفاتحہ', number: 1, nameEnglish: 'Al-Fatiha', startPage: 1, endPage: 1, revelationType: 'Makki', totalAyahs: 7 };

  const lastJuz: Juz = JUZ_DATA.find(
    (j) => pageNum >= j.startPage && pageNum <= j.endPage
  ) || JUZ_DATA[0] || { nameArabic: 'الم', nameUrdu: 'پارہ ۱', number: 1, nameEnglish: 'Alif Lam Meem', startPage: 1, endPage: 21 };

  const bookmarks = QuranDataService.getBookmarks();

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-emerald-900/10 via-gray-50 to-gray-100 dark:from-emerald-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Islamic Top Header */}
      <header className="relative bg-gradient-to-br from-emerald-850 via-emerald-900 to-teal-950 text-white pt-10 pb-16 px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        {/* Subtle decorative Islamic pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbf9f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gold-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-emerald-100 mb-3 backdrop-blur-md">
            <Sparkles size={14} className="text-gold-300 animate-pulse" />
            <span>مصحف التفصيل الموضوعي الملون</span>
          </div>

          <h1 className="text-3xl font-bold font-mushaf text-gold-200 tracking-wide mt-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h1>
          <p className="text-sm text-emerald-200/90 mt-2 font-medium">
            مستند ۱۵ سطری عثمانی مصحف مع موضوعاتی رنگ، حاشیہ اور تجوید
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-4 -mt-10 space-y-6">
        {/* Interactive Quran Universal Search Bar Card */}
        {onOpenSearch && (
          <div
            onClick={onOpenSearch}
            className="bg-white/95 dark:bg-gray-900/90 rounded-2xl p-3.5 md:p-4 shadow-lg border-2 border-emerald-400/80 dark:border-emerald-600/70 backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-gold-200">
                سرچ کریں
              </span>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-gold-300 transition-colors">
                  قرآنِ مجید میں کوئی حرف، لفظ یا موضوع تلاش کریں...
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  فوری لفظی ریسرچ، روٹ ورڈ، آیات و سورتیں (Ctrl + K)
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform">
                <Search size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Continue Reading Card */}
        <section className="bg-white dark:bg-gray-850 rounded-3xl p-5 md:p-6 shadow-md border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                آخری تلاوت
              </span>
              <h3 className="text-xl md:text-2xl font-bold font-mushaf text-gray-900 dark:text-gray-50 mt-1">
                {lastSurah.nameArabic} • صفحہ {pageNum}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {lastSurah.nameUrdu} • {lastJuz.nameUrdu}
              </p>
            </div>

            <button
              onClick={() => onOpenQuran(pageNum)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>پڑھیں</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* Quick Access Action Grid (5 Feature Boxes) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
          {/* 1. Open Quran Reader */}
          <button
            onClick={() => onOpenQuran()}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform mb-3">
              <BookOpen size={22} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">قرآن ریڈر</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">۱۵ سطری موضوعی مصحف</span>
          </button>

          {/* 2. Browse Surahs */}
          <button
            onClick={() => onOpenNavigation('surahs')}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-gold-100 dark:bg-gold-900/50 text-gold-700 dark:text-gold-300 group-hover:scale-110 transition-transform mb-3">
              <Compass size={22} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">فہرستِ سورتیں</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">تمام ۱۱۴ سورتیں</span>
          </button>

          {/* 3. Browse Thematic Topics */}
          <button
            onClick={() => onOpenNavigation('themes')}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 group-hover:scale-110 transition-transform mb-3">
              <Eye size={22} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">موضوعاتی انڈیکس</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">۷ قرآنی موضوعات</span>
          </button>

          {/* 4. Browse Paras / Juz */}
          <button
            onClick={() => onOpenNavigation('juz')}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 group-hover:scale-110 transition-transform mb-3">
              <Compass size={22} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">فہرستِ پارے</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">تمام ۳۰ پارے</span>
          </button>

          {/* 5. Tajweed Rules */}
          <button
            onClick={onOpenTajweedLegend}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="p-2.5 rounded-xl bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 group-hover:scale-110 transition-transform mb-3">
              <Palette size={22} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">تجوید و کلر گائیڈ</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">موضوعات و تجوید قواعد</span>
          </button>
        </section>

        {/* Bookmarks Section */}
        {bookmarks && bookmarks.length > 0 && (
          <section className="bg-white dark:bg-gray-850 rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookmarkIcon size={18} className="text-emerald-600" />
                <span>محفوظ شدہ صفحات (Bookmarks)</span>
              </h3>
              <span className="text-xs text-gray-400">{bookmarks.length} نشان زد</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {bookmarks.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  onClick={() => onOpenQuran(b.pageNumber)}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="text-right">
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                      {b.title || `صفحہ ${b.pageNumber}`}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {b.surahName || ''}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-lg">
                    {b.pageNumber}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
