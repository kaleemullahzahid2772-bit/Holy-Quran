import React, { useState } from 'react';
import { X, Search, Eye, BookOpen, Layers } from 'lucide-react';
import { SURAHS_DATA } from '../data/surahsData';
import { THEMATIC_SUBJECTS_LIST, THEMATIC_PASSAGES } from '../data/quranThematicData';
import { ThematicSubjectId } from '../types/quran';

interface ThematicIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

export const ThematicIndexModal: React.FC<ThematicIndexModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<ThematicSubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter Passages by category and search query
  const filteredPassages = THEMATIC_PASSAGES.filter((p) => {
    if (selectedThemeId !== 'all' && p.subjectId !== selectedThemeId) {
      return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const surah = SURAHS_DATA.find((s) => s.number === p.surah);
    return (
      p.titleArabic.toLowerCase().includes(q) ||
      p.titleUrdu.toLowerCase().includes(q) ||
      (surah && surah.nameArabic.includes(q)) ||
      (surah && surah.nameUrdu.includes(q)) ||
      (surah && surah.nameEnglish.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none" dir="rtl">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              <Eye size={20} />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                موضوعاتی انڈیکس (Thematic Index)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                قرآن مجید کے ۷ موضوعاتی رنگ اور ان کے تحت آیات کی فہرست
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="موضوع، آیت کا مضمون یا سورت تلاش کریں..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl border-none focus:ring-2 focus:ring-purple-500 outline-none placeholder-gray-400 font-sans"
            />
          </div>
        </div>

        {/* Thematic Category Chips */}
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedThemeId('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedThemeId === 'all'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
            }`}
          >
            تمام موضوعات ({THEMATIC_PASSAGES.length})
          </button>
          {THEMATIC_SUBJECTS_LIST.map((theme) => {
            const count = THEMATIC_PASSAGES.filter((p) => p.subjectId === theme.id).length;
            const isSelected = selectedThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                style={{
                  backgroundColor: isSelected ? theme.badgeBg : undefined,
                  color: isSelected ? '#ffffff' : undefined,
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                {theme.nameUrdu.split('،')[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Passages List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 p-2.5 space-y-2">
          {filteredPassages.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              کوئی متعلقہ موضوع نہیں ملا۔
            </div>
          ) : (
            filteredPassages.map((p, idx) => {
              const surah = SURAHS_DATA.find((s) => s.number === p.surah);
              const themeMeta = THEMATIC_SUBJECTS_LIST.find((t) => t.id === p.subjectId);
              const targetPage = surah ? surah.startPage : 1;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPage(targetPage);
                    onClose();
                  }}
                  className="w-full p-3 rounded-2xl border border-gray-200/70 dark:border-gray-800 hover:border-purple-500/60 bg-white dark:bg-gray-850 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all text-right flex items-center justify-between gap-3 shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      style={{ backgroundColor: themeMeta?.badgeBg }}
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    />
                    <span className="text-xs font-bold font-sans text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 group-hover:text-purple-800 transition-colors">
                      صفحہ {targetPage}
                    </span>
                  </div>

                  <div className="text-right flex-1 pr-1">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mushaf">
                      {p.titleArabic}
                    </div>
                    <div className="text-xs text-purple-900 dark:text-purple-300 font-sans mt-0.5">
                      {p.titleUrdu}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-sans flex items-center gap-1.5 justify-start">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {surah ? `سورة ${surah.nameArabic}` : ''}
                      </span>
                      <span>•</span>
                      <span>الآيات {p.fromAyah} تا {p.toAyah}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
