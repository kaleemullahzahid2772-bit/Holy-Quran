import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Palette, ShieldCheck, Database, Info, ExternalLink } from 'lucide-react';
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
  const themes = [
    { id: 'light', name: 'سفید (Light)', desc: 'Clean white background' },
    { id: 'warm-paper', name: 'کاغذی (Warm Paper)', desc: 'Natural parchment tint' },
    { id: 'dark', name: 'نائٹ موڈ (Dark)', desc: 'OLED eye-friendly dark' },
    { id: 'emerald', name: 'زمردی (Emerald)', desc: 'Deep Islamic emerald' },
  ] as const;

  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white pt-8 pb-6 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-quran">ترتیبات</h2>
            <p className="text-xs text-emerald-200 mt-0.5">Application Settings & Info</p>
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

        {/* Reading Preferences */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <SettingsIcon size={16} className="text-emerald-600" />
            <span>مطالعہ کے آپشنز (Preferences)</span>
          </h3>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                صفحہ کے اعداد و شمار دکھائیں (Show Statistics)
              </div>
              <div className="text-[11px] text-gray-400">
                ہر صفحے کے نیچے شماریاتی پینل ظاہر کریں
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
              <span>تجویدی رنگوں کی مکمل فہرست دیکھیں</span>
              <Palette size={16} />
            </button>
          </div>
        </div>

        {/* Database Architecture Status */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
            <Database size={16} className="text-emerald-600" />
            <span>ڈیٹا بیس آرکیٹیکچر (Step 5 Foundation)</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            ریلیشنل اسکیمہ (<code className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">schema.sql</code>) تیار کر لیا گیا ہے:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {[
              'pages (559 pages)',
              'surahs (114 surahs)',
              'juz (30 paras)',
              'ayahs (6236 ayahs)',
              'words (word-by-word)',
              'word_characters',
              'page_statistics',
              'bookmarks & progress',
            ].map((table, i) => (
              <div key={i} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{table}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About & Verification Credits */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>صحتِ متن اور مستند ماخذ (Verification & Credits)</span>
          </h3>

          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
            <p>
              • <strong>بصری نسخہ:</strong> اقراء قرآن کمپنی کا مطبوعہ ۱۶ سطری رنگین تجویدی قرآن مجید۔
            </p>
            <p>
              • <strong>ڈیجیٹل ڈیٹاسیٹ مطابقت:</strong> Quran Foundation (QDC - Mushaf ID 7: INDOPAK_16_LINES)۔
            </p>
            <p>
              • <strong>صحتِ متن ریفرنس:</strong> The Tanzil Project (tanzil.net) تحت Creative Commons Attribution License۔
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 font-medium pt-1">
              شرعی اصول: قرآن مجید کے متن میں کسی خودکار اے آئی یا غیر معتبر سورس سے کوئی لفظ یا اعراب شامل نہیں کیا گیا۔
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
