import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, Sparkles, BookOpen, Database, ShieldCheck, Palette, BookMarked, Eye } from 'lucide-react';
import { AppSettings } from '../types/quran';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenTajweedLegend: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onOpenTajweedLegend,
}) => {
  const themes: { id: AppSettings['theme']; name: string; desc: string }[] = [
    { id: 'light', name: 'روشن (Clean Light)', desc: 'روایتی سفید پس منظر' },
    { id: 'warm-paper', name: 'کاغذی (Warm Paper)', desc: 'قدرتی قدیم پرنٹ شدہ کاغذ' },
    { id: 'emerald', name: 'زمردی (Emerald)', desc: 'پُرسکون اسلامی سبز رنگ' },
    { id: 'dark', name: 'نائٹ موڈ (Night Dark)', desc: 'رات کے وقت آنکھوں کے لیے پرسکون' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 font-sans select-none" dir="rtl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-850 via-emerald-800 to-teal-900 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-urdu">سیٹنگز و ترتیبات</h1>
            <p className="text-xs text-emerald-200 mt-0.5">مصحف التفصيل الموضوعي • ترتیبات و اختیارات</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <SettingsIcon size={24} className="text-gold-300" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Theme Settings Card */}
        <div className="bg-white dark:bg-gray-900 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-3">
            <Palette size={16} className="text-emerald-600" />
            <span>مطالعہ کا تھیم (Reading Theme)</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => onUpdateSettings({ ...settings, theme: t.id })}
                className={`p-3 rounded-xl text-right border text-xs transition-all ${
                  settings.theme === t.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 font-bold'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div className="text-gray-900 dark:text-gray-100">{t.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Thematic & Color Options (الموضوعي والتجويد) */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye size={16} className="text-emerald-600" />
            <span>رنگ و حاشیہ کے اختیارات (Thematic & Tajweed Toggles)</span>
          </h3>

          {/* 1. Thematic Colors Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                موضوعاتی رنگ بندی (Thematic Colors by Subject)
              </div>
              <div className="text-[11px] text-gray-400">
                دار الفجر کے 7 موضوعاتی پیسٹل رنگ آیات کے پس منظر میں ظاہر کریں
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showThematicColors ?? true}
              onChange={(e) =>
                onUpdateSettings({ ...settings, showThematicColors: e.target.checked })
              }
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* 2. Tajweed Colors Toggle */}
          <div className="flex items-center justify-between py-1 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                حروف پر تجویدی رنگ (Tajweed Letter Rules)
              </div>
              <div className="text-[11px] text-gray-400">
                مد، غنہ، قلقلہ، اخفاء اور تفخیم کے مستند کلر کوڈز
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showTajweedColors ?? true}
              onChange={(e) =>
                onUpdateSettings({ ...settings, showTajweedColors: e.target.checked })
              }
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* 3. Marginal Vocabulary Toggle */}
          <div className="flex items-center justify-between py-1 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                حاشیہ معانی الکلمات (Marginal Vocabulary)
              </div>
              <div className="text-[11px] text-gray-400">
                صفحے کے مشکل الفاظ کے معانی حاشیے میں عربی مع اردو ترجمہ دکھائیں
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showMarginalVocabulary ?? true}
              onChange={(e) =>
                onUpdateSettings({ ...settings, showMarginalVocabulary: e.target.checked })
              }
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          {/* 4. Page Statistics Toggle */}
          <div className="flex items-center justify-between py-1 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                صفحہ کے شماریاتی اعداد و شمار (Show Statistics)
              </div>
              <div className="text-[11px] text-gray-400">
                ہر صفحے کے اعراب، حروف اور الفاظ کی گنتی کا پینل
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.showPageStatistics}
              onChange={(e) =>
                onUpdateSettings({ ...settings, showPageStatistics: e.target.checked })
              }
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={onOpenTajweedLegend}
              className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
            >
              <span>تجویدی رنگوں کی گائیڈ دیکھیں</span>
              <Palette size={16} />
            </button>
          </div>
        </div>

        {/* Database Architecture Status */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
            <Database size={16} className="text-emerald-600" />
            <span>مصحف آرکیٹیکچر (15-Line Madani Thematic)</span>
          </h3>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              'pages (604 pages Madani)',
              '15-line authentic Medina grid',
              'surahs (114 surahs)',
              'juz (30 paras)',
              'thematic categories (7 themes)',
              'ayahs (6236 ayahs)',
              'words (word-by-word with Tajweed)',
              'word occurrences & roots',
              'marginal vocabulary (معانی الکلمات)',
              'page statistics & diacritics',
            ].map((table, i) => (
              <div key={i} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{table}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Credits */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>صحتِ متن اور مستند ماخذ (Verification & Sources)</span>
          </h3>

          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
            <p>
              • <strong>موضوعاتی ماخذ:</strong> دار الفجر الاسلامی کا مستند "مصحف التفصيل الموضوعي مع تفسير كلمات القرآن"۔
            </p>
            <p>
              • <strong>رسم الخط:</strong> مصحف مدینہ منورہ (مجمع الملک فہد)، ۱۵ سطری عثمانی رسم الخط، ۶۰۴ صفحات۔
            </p>
            <p>
              • <strong>انٹرایکٹو فیچرز:</strong> ہر لفظ پر کلک سے روٹ ورڈ، تکرار، مکمل نحوی و صرفی تفصیلات اور موضوعاتی زمرہ محفوظ ہیں۔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
