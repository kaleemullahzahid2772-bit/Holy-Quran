import React from 'react';
import { X, Palette } from 'lucide-react';
import { TAJWEED_RULES } from '../data/tajweedLegend';

interface TajweedLegendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TajweedLegendModal: React.FC<TajweedLegendModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Palette size={20} className="text-gold-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">تجویدی رنگوں کے اصول</h3>
              <p className="text-xs text-emerald-200">Tajweed Color Rules (Page 558)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Rules List */}
        <div className="p-6 overflow-y-auto space-y-4 text-right" dir="rtl">
          {TAJWEED_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900"
                    style={{ backgroundColor: rule.colorHex }}
                  />
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {rule.nameUrdu}
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-gray-400 font-sans" dir="ltr">
                  {rule.nameEnglish}
                </span>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pr-6">
                {rule.descriptionUrdu}
              </p>

              {rule.examples.length > 0 && (
                <div className="mt-2.5 pr-6 flex items-center gap-2 text-xs">
                  <span className="text-gray-400">مثالیں:</span>
                  <div className="flex gap-2 font-quran text-base font-semibold text-gray-800 dark:text-gray-200">
                    {rule.examples.map((ex, i) => (
                      <span key={i} className="bg-white dark:bg-gray-700/60 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            یہ رنگین تجویدی علامتیں اصل مطبوعہ ۱۶ سطری نسخے کے عین مطابق ہیں۔
          </p>
        </div>
      </div>
    </div>
  );
};
