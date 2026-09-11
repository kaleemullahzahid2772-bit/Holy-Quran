import React from 'react';
import { Bookmark as BookmarkIcon, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { Bookmark } from '../types/quran';

interface BookmarksScreenProps {
  bookmarks: Bookmark[];
  onOpenPage: (pageNumber: number) => void;
  onDeleteBookmark: (id: string) => void;
  onStartReading: () => void;
}

export const BookmarksScreen: React.FC<BookmarksScreenProps> = ({
  bookmarks,
  onOpenPage,
  onDeleteBookmark,
  onStartReading,
}) => {
  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white pt-8 pb-6 px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-quran">محفوظ شدہ صفحات</h2>
            <p className="text-xs text-emerald-200 mt-0.5">Saved Bookmarks ({bookmarks.length})</p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl">
            <BookmarkIcon size={24} className="text-gold-300" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {bookmarks.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <BookmarkIcon size={32} />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">کوئی بک مارک موجود نہیں</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                قرآن پڑھتے ہوئے کسی بھی صفحے کے اوپر موجود بک مارک بٹن پر کلک کر کے محفوظ کریں۔
              </p>
            </div>
            <button
              onClick={onStartReading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
            >
              <BookOpen size={16} />
              <span>تلاوت شروع کریں</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-emerald-500 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold font-sans text-sm border border-emerald-200 dark:border-emerald-800">
                    {bm.pageNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 font-quran text-lg leading-tight">
                      {bm.surahName || `صفحہ ${bm.pageNumber}`}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(bm.createdAt).toLocaleDateString('ur-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenPage(bm.pageNumber)}
                    className="px-3.5 py-1.5 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>کھولیں</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteBookmark(bm.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="حذف کریں"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
