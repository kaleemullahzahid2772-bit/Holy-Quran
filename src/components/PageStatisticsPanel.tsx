import React from 'react';
import { BarChart2, ChevronDown, ChevronUp, Database, Sparkles } from 'lucide-react';
import { PageStatistics } from '../types/quran';

interface PageStatisticsPanelProps {
  statistics: PageStatistics;
  isOpen: boolean;
  onToggle: () => void;
  pageNumber: number;
}

export const PageStatisticsPanel: React.FC<PageStatisticsPanelProps> = ({
  statistics,
  isOpen,
  onToggle,
  pageNumber,
}) => {
  const sAny = statistics as any;
  const dCounts = sAny?.diacriticsCounts || {};
  const tCounts = sAny?.tajweedCounts || {};

  const totalWords = statistics?.totalWords ?? sAny?.wordCount ?? 0;
  const totalLetters = statistics?.totalLetters ?? sAny?.letterCount ?? 0;
  const countFatha = statistics?.countFatha ?? dCounts.fatha ?? 0;
  const countKasra = statistics?.countKasra ?? dCounts.kasra ?? 0;
  const countDamma = statistics?.countDamma ?? dCounts.damma ?? 0;
  const countFathatan = statistics?.countFathatan ?? dCounts.fathatan ?? 0;
  const countKasratan = statistics?.countKasratan ?? dCounts.kasratan ?? 0;
  const countDammatan = statistics?.countDammatan ?? dCounts.dammatan ?? 0;
  const countSukoon = statistics?.countSukoon ?? dCounts.sukoon ?? 0;
  const countShaddah = statistics?.countShaddah ?? dCounts.shaddah ?? 0;
  const countMaddah = statistics?.countMaddah ?? dCounts.maddah ?? tCounts.madd ?? 0;
  const countStandingFatha = statistics?.countStandingFatha ?? dCounts.standingFatha ?? 0;
  const countStandingKasra = statistics?.countStandingKasra ?? dCounts.standingKasra ?? 0;
  const countInvertedDamma = statistics?.countInvertedDamma ?? dCounts.invertedDamma ?? 0;
  const countHeavyLetters = statistics?.countHeavyLetters ?? dCounts.heavyLetters ?? tCounts.tafkhim ?? 0;
  const countQalqalah = statistics?.countQalqalah ?? dCounts.qalqalah ?? tCounts.qalqalah ?? 0;

  const totalTanween = countFathatan + countKasratan + countDammatan;
  const totalStanding = countStandingFatha + countStandingKasra + countInvertedDamma;

  const mainStats = [
    { labelUrdu: 'کل الفاظ', labelEng: 'Words', val: totalWords, color: 'text-amber-700 dark:text-amber-300' },
    { labelUrdu: 'کل حروف', labelEng: 'Letters', val: totalLetters, color: 'text-emerald-700 dark:text-emerald-300' },
    { labelUrdu: 'حروفِ مستعلیہ', labelEng: 'Heavy (خ ص ض...)', val: countHeavyLetters, color: 'text-green-700 dark:text-green-400' },
    { labelUrdu: 'حروفِ قلقلہ', labelEng: 'Qalqalah (ق ط ب...)', val: countQalqalah, color: 'text-sky-700 dark:text-sky-400' },
    { labelUrdu: 'مدّات', labelEng: 'Maddah (~)', val: countMaddah, color: 'text-rose-700 dark:text-rose-400' },
    { labelUrdu: 'تشدید', labelEng: 'Shaddah ( ّ )', val: countShaddah, color: 'text-purple-700 dark:text-purple-300' },
  ];

  const harakatStats = [
    { labelUrdu: 'زبر (فتحه)', labelEng: 'Fatha ( َ )', val: countFatha },
    { labelUrdu: 'زیر (کسره)', labelEng: 'Kasra ( ِ )', val: countKasra },
    { labelUrdu: 'پیش (ضمّه)', labelEng: 'Damma ( ُ )', val: countDamma },
    { labelUrdu: 'سکون / جزم', labelEng: 'Sukoon ( ْ )', val: countSukoon },
    { labelUrdu: 'دو زبر / تنوین', labelEng: 'Tanween ( ً ٍ ٌ )', val: totalTanween },
    { labelUrdu: 'کھڑی حرکات', labelEng: 'Standing ( ٰ ٖ ٗ )', val: totalStanding },
  ];

  return (
    <div className="bg-white/95 dark:bg-emerald-950/95 border-t border-gray-200 dark:border-emerald-800/80 shadow-lg backdrop-blur-md transition-all duration-300">
      {/* Compact Header Bar */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            صفحہ {pageNumber} کے حقیقی اعداد و شمار (Page Statistics)
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
            {statistics.isCalculated ? '✓ مستند و مصدقہ (Authentic Calculated)' : 'Awaiting DB'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>{isOpen ? 'چھپائیں' : 'تفصیل دیکھیں'}</span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {/* Expandable Statistics Grid */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 animate-fade-in border-t border-gray-100 dark:border-emerald-900/50">
          {/* Primary Counts */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-2">
            {mainStats.map((item, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-center"
              >
                <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {item.labelUrdu}
                </div>
                <div className="text-[9px] text-gray-400 font-sans">{item.labelEng}</div>
                <div className={`text-base font-extrabold mt-0.5 font-sans ${item.color}`}>
                  {item.val !== undefined && item.val !== null ? item.val.toLocaleString() : '—'}
                </div>
              </div>
            ))}
          </div>

          {/* Diacritics & Harakat */}
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
            <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">حرکات و علامات (Diacritics Breakdown)</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {harakatStats.map((item, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100/60 dark:border-emerald-900/40 text-center"
                >
                  <div className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    {item.labelUrdu}
                  </div>
                  <div className="text-[8px] text-gray-400 font-sans">{item.labelEng}</div>
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-0.5 font-sans">
                    {item.val !== undefined && item.val !== null ? item.val.toLocaleString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 mt-2.5 text-center">
            <Database size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>
              تمام اعداد و شمار پورے مصحف کے تصدیق شدہ 16-سطری ڈیجیٹل ڈیٹا سیٹ سے براہ راست شمار کیے گئے ہیں۔
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
