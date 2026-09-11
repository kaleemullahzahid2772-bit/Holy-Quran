import React from 'react';
import { Home, BookOpen, Bookmark, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'quran' | 'bookmarks' | 'settings';
  setActiveTab: (tab: 'home' | 'quran' | 'bookmarks' | 'settings') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', labelUrdu: 'ہوم', labelEng: 'Home', icon: Home },
    { id: 'quran', labelUrdu: 'مصحف', labelEng: 'Quran', icon: BookOpen },
    { id: 'bookmarks', labelUrdu: 'بک مارکس', labelEng: 'Bookmarks', icon: Bookmark },
    { id: 'settings', labelUrdu: 'ترتیبات', labelEng: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md border-t border-gray-200 dark:border-emerald-800/60 shadow-lg pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-300 font-semibold scale-105'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-transparent'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
              </div>
              <span className="text-[11px] mt-0.5 font-medium">{item.labelUrdu}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
