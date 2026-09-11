import React from 'react';
import { BookOpen, Bookmark, Sparkles, Compass, Clock, ChevronRight, BarChart2, Palette } from 'lucide-react';
import { ReadingProgress } from '../types/quran';
import { SURAHS_DATA } from '../data/surahsData';
import { JUZ_DATA } from '../data/juzData';

interface HomeScreenProps {
  readingProgress: ReadingProgress;
  onOpenQuran: (page?: number) => void;
  onOpenNavigation: (tab: 'surahs' | 'juz' | 'pages') => void;
  onOpenTajweedLegend: () => void;
  onOpenBookmarks: () => void;
  onOpenQuranStatistics: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  readingProgress,
  onOpenQuran,
  onOpenNavigation,
  onOpenTajweedLegend,
  onOpenBookmarks,
  onOpenQuranStatistics,
}) => {
  const lastSurah = SURAHS_DATA.find((s) => s.number === readingProgress.lastSurahNumber) || SURAHS_DATA[0];
  const lastJuz = JUZ_DATA.find((j) => j.number === readingProgress.lastJuzNumber) || JUZ_DATA[0];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-emerald-900/10 via-gray-50 to-gray-100 dark:from-emerald-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Islamic Top Header */}
      <header className="relative bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white pt-10 pb-16 px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden">
        {/* Subtle decorative Islamic pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbf9f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-gold-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-md mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide text-emerald-100 mb-3 backdrop-blur-md">
            <Sparkles size={14} className="text-gold-300 animate-pulse" />
            <span>16-Line Indo-Pak Tajweed Mushaf</span>
          </div>

          <h1 className="text-3xl font-bold font-quran text-gold-200 tracking-wide mt-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h1>
          <p className="text-sm text-emerald-200/90 mt-2 font-medium">
            مستند ۱۶ سطری رنگین تجویدی قرآنِ مجید
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto px-4 -mt-10 space-y-6">
        {/* Continue Reading Card */}
        <section className="bg-white dark:bg-emerald-950/80 rounded-2xl p-5 md:p-6 shadow-lg border border-emerald-100 dark:border-emerald-800/60 backdrop-blur-sm relative overflow-hidden transition-all hover:shadow-xl">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
              <Clock size={15} />
              آخری مطالعہ (Continue Reading)
            </span>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold px-3 py-1 rounded-full">
              صفحہ {readingProgress.lastPageNumber}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold font-quran text-emerald-950 dark:text-emerald-100">
                {lastSurah.nameArabic}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {lastSurah.nameUrdu} • {lastJuz.nameUrdu}
              </p>
            </div>

            <button
              onClick={() => onOpenQuran(readingProgress.lastPageNumber)}
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
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">مکمل ۱۶ سطری مصحف</span>
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

          {/* 3. Browse Paras / Juz */}
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

          {/* 4. Bookmarks */}
          <button
            onClick={onOpenBookmarks}
            className="flex flex-col items-start p-4 bg-white dark:bg-gray-800/90 rounded-2xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:border-emerald-500 hover:shadow-md transition-all text-right group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 group-hover:scale-110 transition-transform mb-3">
              <Bookmark size={22} />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">بک مارکس</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">محفوظ شدہ صفحات</span>
          </button>

          {/* 5. Quranic Statistics (قرآنی شماریات - 5th Box) */}
          <button
            onClick={onOpenQuranStatistics}
            className="col-span-2 sm:col-span-1 flex flex-col items-start p-4 bg-gradient-to-br from-white via-white to-purple-50/50 dark:from-gray-800/90 dark:via-gray-800/90 dark:to-purple-950/40 rounded-2xl shadow-sm border border-purple-200/90 dark:border-purple-800/70 hover:border-purple-500 hover:shadow-md transition-all text-right group cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 group-hover:scale-110 transition-transform">
                <BarChart2 size={22} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                مکمل قرآن
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">قرآنی شماریات</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">حروف، اعراب و نقاط</span>
          </button>
        </section>

        {/* Tajweed Legend Feature Card */}
        <section
          onClick={onOpenTajweedLegend}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm">
              <Palette size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">تجویدی کلر گائیڈ (Tajweed Guide)</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                قلقلہ، غنہ، مد، ادغام اور تفخیم کے رنگین اصول
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-emerald-700 dark:text-emerald-400" />
        </section>
      </main>
    </div>
  );
};
