import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { QuranReader } from './components/QuranReader';
import { BookmarksScreen } from './components/BookmarksScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { DesktopNavbar } from './components/DesktopNavbar';
import { NavigationModal } from './components/NavigationModal';
import { ThematicIndexModal } from './components/ThematicIndexModal';
import { TajweedLegendModal } from './components/TajweedLegendModal';
import { QuranStatsModal } from './components/QuranStatsModal';
import { SearchModal } from './components/SearchModal';
import { QuranDataService } from './database/quranDataService';
import { AppSettings, Bookmark, ReadingProgress } from './types/quran';

export function App() {
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('page')) return 'quran';
    } catch (e) {}
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<'home' | 'quran' | 'bookmarks' | 'settings'>(getInitialTab());
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(QuranDataService.getReadingProgress());
  
  const getInitialPage = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('page') || '', 10);
      if (p >= 1 && p <= 604) return p;
    } catch (e) {}
    return readingProgress.lastPageNumber || 2;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPage());
  const [settings, setSettings] = useState<AppSettings>(QuranDataService.getSettings());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(QuranDataService.getBookmarks());
  
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [navInitialTab, setNavInitialTab] = useState<'surahs' | 'juz'>('surahs');
  const [isThematicModalOpen, setIsThematicModalOpen] = useState(false);
  const [isTajweedModalOpen, setIsTajweedModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global Ctrl+K / / shortcut to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || e.key === '/') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Apply Theme to DOM
  useEffect(() => {
    const isDark = settings.theme === 'dark' || settings.theme === 'emerald';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(604, newPage));
    setCurrentPage(clamped);
    QuranDataService.saveReadingProgress(clamped);
    setReadingProgress(QuranDataService.getReadingProgress());
    setBookmarks(QuranDataService.getBookmarks());
  };

  // Open Reader directly to a page
  const handleOpenQuran = (pageNumber?: number) => {
    if (pageNumber) {
      handlePageChange(pageNumber);
    }
    setActiveTab('quran');
  };

  // Open Navigation modal with specific tab
  const handleOpenNavigation = (tab: 'surahs' | 'juz') => {
    setNavInitialTab(tab);
    setIsNavModalOpen(true);
  };

  // Delete Bookmark
  const handleDeleteBookmark = (id: string) => {
    QuranDataService.deleteBookmark(id);
    setBookmarks(QuranDataService.getBookmarks());
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    QuranDataService.saveSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Desktop Header Navigation (md: screens and up) */}
      <DesktopNavbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'bookmarks') {
            setBookmarks(QuranDataService.getBookmarks());
          }
        }}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onOpenNavigationModal={() => setIsNavModalOpen(true)}
        readingProgress={readingProgress}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenQuranStatistics={() => setIsStatsModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />

      {/* Active Screen View */}
      {activeTab === 'home' && (
        <HomeScreen
          readingProgress={readingProgress}
          onOpenQuran={handleOpenQuran}
          onOpenNavigation={handleOpenNavigation}
          onOpenThematicIndex={() => setIsThematicModalOpen(true)}
          onOpenTajweedLegend={() => setIsTajweedModalOpen(true)}
          onOpenBookmarks={() => setActiveTab('bookmarks')}
          onOpenQuranStatistics={() => setIsStatsModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          settings={settings}
        />
      )}

      {activeTab === 'quran' && (
        <QuranReader
          currentPage={currentPage}
          onPageChange={handlePageChange}
          theme={settings.theme}
          showStatisticsSetting={settings.showPageStatistics}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          settings={settings}
        />
      )}

      {activeTab === 'bookmarks' && (
        <BookmarksScreen
          bookmarks={bookmarks}
          onOpenPage={handleOpenQuran}
          onDeleteBookmark={handleDeleteBookmark}
          onStartReading={() => handleOpenQuran(2)}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenTajweedLegend={() => setIsTajweedModalOpen(true)}
        />
      )}

      {/* Global Universal Quran Search Modal (Letters, Words, Surahs, Juz, Occurrences) */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectPage={(page) => {
          handleOpenQuran(page);
        }}
      />

      {/* Global Navigation Modal (Surahs, Paras, Page Jump) */}
      <NavigationModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        initialTab={navInitialTab}
        currentPage={currentPage}
        onSelectPage={(page) => {
          handleOpenQuran(page);
        }}
      />

      {/* Global Tajweed Color Rules Modal */}
      <TajweedLegendModal
        isOpen={isTajweedModalOpen}
        onClose={() => setIsTajweedModalOpen(false)}
      />

      {/* Grand Quran Statistics & Analytics Modal */}
      <QuranStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
      />

      {/* Dedicated Thematic Index Modal */}
      <ThematicIndexModal
        isOpen={isThematicModalOpen}
        onClose={() => setIsThematicModalOpen(false)}
        onSelectPage={(page) => {
          handleOpenQuran(page);
        }}
      />

      {/* Bottom Navigation (Always accessible unless distraction-free in Quran reader) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'bookmarks') {
            setBookmarks(QuranDataService.getBookmarks());
          }
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
      />
    </div>
  );
}

export default App;
