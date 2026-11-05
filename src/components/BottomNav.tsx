import React from 'react';
import { Home, BookOpen, Bookmark, Settings, Search } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'quran' | 'bookmarks' | 'settings';
  setActiveTab: (tab: 'home' | 'quran' | 'bookmarks' | 'settings') => void;
  onOpenSearch?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenSearch }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md border-t border-gray-200 dark:border-emerald-800/60 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === 'home'
              ? 'text-emerald-700 dark:text-emerald-300 font-semibold scale-105'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'home' ? 'bg-emerald-100 dark:bg-emerald-900/60' : ''}`}>
            <Home size={19} strokeWidth={activeTab === 'home' ? 2.3 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">ہوم</span>
        </button>

        {/* Quran Mushaf */}
        <button
          onClick={() => setActiveTab('quran')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === 'quran'
              ? 'text-emerald-700 dark:text-emerald-300 font-semibold scale-105'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'quran' ? 'bg-emerald-100 dark:bg-emerald-900/60' : ''}`}>
            <BookOpen size={19} strokeWidth={activeTab === 'quran' ? 2.3 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">مصحف</span>
        </button>

        {/* Universal Search (Center Button) */}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 -mt-3 group cursor-pointer"
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 border-2 border-white dark:border-emerald-950 group-active:scale-95 transition-transform">
              <Search size={20} strokeWidth={2.4} />
            </div>
            <span className="text-[10px] mt-0.5 font-bold text-amber-700 dark:text-amber-400">تلاش</span>
          </button>
        )}

        {/* Bookmarks */}
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === 'bookmarks'
              ? 'text-emerald-700 dark:text-emerald-300 font-semibold scale-105'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'bookmarks' ? 'bg-emerald-100 dark:bg-emerald-900/60' : ''}`}>
            <Bookmark size={19} strokeWidth={activeTab === 'bookmarks' ? 2.3 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">بک مارکس</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 ${
            activeTab === 'settings'
              ? 'text-emerald-700 dark:text-emerald-300 font-semibold scale-105'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
          }`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'settings' ? 'bg-emerald-100 dark:bg-emerald-900/60' : ''}`}>
            <Settings size={19} strokeWidth={activeTab === 'settings' ? 2.3 : 1.8} />
          </div>
          <span className="text-[10px] mt-0.5 font-medium">ترتیبات</span>
        </button>

      </div>
    </nav>
  );
};
