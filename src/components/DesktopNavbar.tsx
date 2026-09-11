import React, { useState } from 'react';
import {
  BookOpen,
  Home,
  Bookmark,
  Settings,
  Compass,
  Maximize,
  Minimize,
  Palette,
  ArrowRight,
  BarChart2
} from 'lucide-react';
import { ReadingProgress, AppSettings } from '../types/quran';

interface DesktopNavbarProps {
  activeTab: 'home' | 'quran' | 'bookmarks' | 'settings';
  setActiveTab: (tab: 'home' | 'quran' | 'bookmarks' | 'settings') => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  onOpenNavigationModal: () => void;
  onOpenQuranStatistics?: () => void;
  readingProgress: ReadingProgress;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const DesktopNavbar: React.FC<DesktopNavbarProps> = ({
  activeTab,
  setActiveTab,
  currentPage,
  onPageChange,
  onOpenNavigationModal,
  onOpenQuranStatistics,
  readingProgress,
  settings,
  onUpdateSettings,
}) => {
  const [jumpPageInput, setJumpPageInput] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= 559) {
      onPageChange(p);
      setActiveTab('quran');
      setJumpPageInput('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const nextTheme = () => {
    const themeOrder: Array<'light' | 'warm-paper' | 'dark' | 'emerald'> = [
      'warm-paper',
      'light',
      'emerald',
      'dark'
    ];
    const currentIndex = themeOrder.indexOf(settings.theme);
    const next = themeOrder[(currentIndex + 1) % themeOrder.length];
    onUpdateSettings({ ...settings, theme: next });
  };

  const navTabs = [
    { id: 'home', label: 'ہوم', eng: 'Home', icon: Home },
    { id: 'quran', label: 'قرآنِ مجید (مصحف)', eng: 'Reader', icon: BookOpen },
    { id: 'bookmarks', label: 'محفوظ شدہ صفحات', eng: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'ترتیبات', eng: 'Settings', icon: Settings },
  ] as const;

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/95 dark:bg-emerald-950/95 backdrop-blur-md border-b border-gold-400/30 dark:border-emerald-800/80 shadow-sm transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onPageChange(readingProgress.lastPageNumber || 2);
              setActiveTab('quran');
            }}
            className="flex items-center gap-2.5 text-right group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-gold-300 shadow-md border border-gold-400/40 group-hover:scale-105 transition-transform">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="font-bold font-quran text-lg text-emerald-950 dark:text-gold-200 leading-tight">
                القرآن الكريم
              </div>
              <div className="text-[11px] text-gray-500 dark:text-emerald-300/80 font-sans">
                ۱۶ سطری رنگین تجویدی مصحف (Desktop)
              </div>
            </div>
          </button>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-gray-100/90 dark:bg-emerald-900/40 p-1 rounded-2xl border border-gray-200/80 dark:border-emerald-800/60">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-emerald-800 text-emerald-900 dark:text-gold-200 shadow-sm font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-emerald-800/30'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-700 dark:text-gold-300' : ''} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Page Jump & Desktop Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Page Jump Form */}
          <form onSubmit={handleJumpSubmit} className="flex items-center">
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max="559"
                placeholder="صفحہ (1-559)"
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-28 pl-2 pr-7 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 dark:text-gray-200 font-sans text-right"
              />
              <button
                type="submit"
                className="absolute right-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-0.5 cursor-pointer"
                title="صفحہ پر جائیں"
              >
                <ArrowRight size={13} className="rotate-180" />
              </button>
            </div>
          </form>

          {/* Surah / Para Index Modal Trigger */}
          <button
            onClick={onOpenNavigationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/50 dark:hover:bg-emerald-900 text-emerald-800 dark:text-gold-200 border border-emerald-200 dark:border-emerald-700/60 text-xs font-semibold transition-colors cursor-pointer"
            title="فہرست سورتیں و پارے"
          >
            <Compass size={15} />
            <span className="hidden lg:inline">فہرست (Index)</span>
          </button>

          {/* Grand Quran Statistics Trigger */}
          {onOpenQuranStatistics && (
            <button
              onClick={onOpenQuranStatistics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700/60 text-xs font-semibold transition-colors cursor-pointer"
              title="قرآنی شماریات و اعداد و شمار"
            >
              <BarChart2 size={15} />
              <span className="hidden lg:inline">شماریات (Stats)</span>
            </button>
          )}

          {/* Theme Quick Switcher */}
          <button
            onClick={nextTheme}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            title={`تھیم تبدیل کریں (موجودہ: ${settings.theme})`}
          >
            <Palette size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'مکمل اسکرین سے باہر نکلیں (Exit Fullscreen)' : 'مکمل اسکرین موڈ (Fullscreen)'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>

      </div>
    </header>
  );
};
