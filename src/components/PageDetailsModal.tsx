import React from 'react';
import {
  X,
  BarChart2,
  Database,
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { PageStatistics, Surah, Juz } from '../types/quran';

interface PageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: PageStatistics | null;
  pageNumber: number;
  surah: Surah | null;
  juz: Juz | null;
}

export const PageDetailsModal: React.FC<PageDetailsModalProps> = ({
  isOpen,
  onClose,
  statistics,
  pageNumber,
  surah,
  juz,
}) => {
  if (!isOpen || !statistics) return null;

  const sAny = statistics as any;
  const dCounts = sAny?.diacriticsCounts || {};
  const tCounts = sAny?.tajweedCounts || {};

  const totalWords = statistics.totalWords ?? sAny?.wordCount ?? 0;
  const totalLetters = statistics.totalLetters ?? sAny?.letterCount ?? 0;
  const countFatha = statistics.countFatha ?? dCounts.fatha ?? 0;
  const countKasra = statistics.countKasra ?? dCounts.kasra ?? 0;
  const countDamma = statistics.countDamma ?? dCounts.damma ?? 0;
  const countFathatan = statistics.countFathatan ?? dCounts.fathatan ?? 0;
  const countKasratan = statistics.countKasratan ?? dCounts.kasratan ?? 0;
  const countDammatan = statistics.countDammatan ?? dCounts.dammatan ?? 0;
  const countSukoon = statistics.countSukoon ?? dCounts.sukoon ?? 0;
  const countShaddah = statistics.countShaddah ?? dCounts.shaddah ?? 0;
  const countMaddah = statistics.countMaddah ?? dCounts.maddah ?? tCounts.madd ?? 0;
  const countStandingFatha = statistics.countStandingFatha ?? dCounts.standingFatha ?? 0;
  const countStandingKasra = statistics.countStandingKasra ?? dCounts.standingKasra ?? 0;
  const countInvertedDamma = statistics.countInvertedDamma ?? dCounts.invertedDamma ?? 0;
  const countHeavyLetters = statistics.countHeavyLetters ?? dCounts.heavyLetters ?? tCounts.tafkhim ?? 0;
  const countQalqalah = statistics.countQalqalah ?? dCounts.qalqalah ?? tCounts.qalqalah ?? 0;

  const totalTanween = countFathatan + countKasratan + countDammatan;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border-t sm:border border-emerald-200 dark:border-emerald-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                صفحہ {pageNumber} کی مکمل تفصیلات (Page Details)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {surah ? `سورة ${surah.nameArabic}` : ''} {juz ? `• ${juz.nameUrdu}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-right" dir="rtl">
          {/* Main Top Cards: Words, Letters, Heavy Letters, Qalqalah */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Total Words */}
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
              <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold block mb-1">
                کل الفاظ (Words)
              </span>
              <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 font-sans">
                {totalWords.toLocaleString()}
              </span>
            </div>

            {/* Total Letters */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block mb-1">
                کل حروف (Letters)
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 font-sans">
                {totalLetters.toLocaleString()}
              </span>
            </div>

            {/* Heavy Letters */}
            <div className="p-3 rounded-2xl bg-green-50/80 dark:bg-green-950/30 border border-green-200/60 dark:border-green-900/40 text-center">
              <span className="text-[10px] text-green-700 dark:text-green-300 font-bold block mb-1">
                موٹے حروف (Heavy)
              </span>
              <span className="text-2xl font-extrabold text-green-800 dark:text-green-300 font-sans">
                {countHeavyLetters.toLocaleString()}
              </span>
            </div>

            {/* Qalqalah */}
            <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 text-center">
              <span className="text-[10px] text-sky-700 dark:text-sky-300 font-bold block mb-1">
                حروفِ قلقلہ
              </span>
              <span className="text-2xl font-extrabold text-sky-800 dark:text-sky-300 font-sans">
                {countQalqalah.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Section 1: حرکات و اعراب (Vowels & Diacritics Breakdown) */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 dark:border-gray-700/60 pb-2">
              <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span>حرکات و اعراب کی تفصیلی گنتی (Diacritics Count)</span>
              </h4>
              <span className="text-[10px] text-gray-400 font-sans">اس صفحہ پر کل تعداد</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Zabar (Fatha) */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    زبر (فَتحَہ)
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">Fatha</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mushaf font-bold text-emerald-600">َ</span>
                  <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-sans">
                    {countFatha.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Zer (Kasra) */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    زیر (کَسرَہ)
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">Kasra</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mushaf font-bold text-emerald-600">ِ</span>
                  <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-sans">
                    {countKasra.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Pesh (Damma) */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    پیش (ضَمَّہ)
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">Damma</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mushaf font-bold text-emerald-600">ُ</span>
                  <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-sans">
                    {countDamma.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Sukoon / Jazm */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    جزم / سکون
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">Sukoon</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mushaf font-bold text-gray-500">ْ</span>
                  <span className="text-base font-extrabold text-gray-900 dark:text-gray-100 font-sans">
                    {countSukoon.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Shaddah */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    تشدید
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">Shaddah</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mushaf font-bold text-purple-600">ّ</span>
                  <span className="text-base font-extrabold text-purple-700 dark:text-purple-300 font-sans">
                    {countShaddah.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Maddah */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    مدّات
                  </div>
                  <div className="text-[9px] text-gray-400 font-sans">Maddah</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-mushaf font-bold text-rose-600">~</span>
                  <span className="text-base font-extrabold text-rose-700 dark:text-rose-300 font-sans">
                    {countMaddah.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: تنوین و کھڑی حرکات (Tanween & Standing Harakat) */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-xs text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1.5 border-b border-gray-200/60 dark:border-gray-700/60 pb-2">
              <Layers size={14} className="text-amber-600" />
              <span>تنوین اور کھڑی حرکات (Tanween & Standing Marks)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Do Zabar (Fathatan) */}
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-[10px] text-gray-500">دو زبر (ً)</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 font-sans">
                  {countFathatan}
                </div>
              </div>

              {/* Do Zer (Kasratan) */}
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-[10px] text-gray-500">دو زیر (ٍ)</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 font-sans">
                  {countKasratan}
                </div>
              </div>

              {/* Do Pesh (Dammatan) */}
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-[10px] text-gray-500">دو پیش (ٌ)</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 font-sans">
                  {countDammatan}
                </div>
              </div>

              {/* Total Tanween */}
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-center">
                <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300">کل تنوین</div>
                <div className="text-sm font-extrabold text-amber-900 dark:text-amber-200 mt-0.5 font-sans">
                  {totalTanween}
                </div>
              </div>
            </div>

            {/* Standing marks row */}
            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-[10px] text-gray-500">کھڑی زبر (ٰ)</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 font-sans">
                  {countStandingFatha}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-[10px] text-gray-500">کھڑی زیر (ٖ)</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 font-sans">
                  {countStandingKasra}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                <div className="text-[10px] text-gray-500">الٹا پیش (ٗ)</div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5 font-sans">
                  {countInvertedDamma}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: تجویدی و صوتی خصوصیات (Tajweed Features) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50">
            <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>تجویدی و صوتی خصوصیات (Tajweed Features)</span>
            </h4>

            <div className="space-y-2 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80">
                <div>
                  <span className="font-bold">حروفِ مستعلیہ (موٹے حروف):</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1.5 font-mushaf">
                    (خ، ص، ض، ط، ظ، غ، ق)
                  </span>
                </div>
                <span className="font-extrabold text-green-700 dark:text-green-400 font-sans">
                  {countHeavyLetters} بار
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80">
                <div>
                  <span className="font-bold">حروفِ قلقلہ (جھٹکے والے حروف):</span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 mr-1.5 font-mushaf">
                    (ق، ط، ب، ج، د)
                  </span>
                </div>
                <span className="font-extrabold text-sky-700 dark:text-sky-400 font-sans">
                  {countQalqalah} بار
                </span>
              </div>
            </div>
          </div>

          {/* Authentic Verification Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 pt-1 text-center">
            <Database size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>
              تمام اعداد و شمار پورے مصحف کے مستند ۱۶ سطری ڈیجیٹل ڈیٹاسیٹ سے لائیو اور مصدقہ ہیں۔
            </span>
          </div>
        </div>

        {/* Modal Bottom Button */}
        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95"
          >
            بند کریں (Dismiss)
          </button>
        </div>
      </div>
    </div>
  );
};
