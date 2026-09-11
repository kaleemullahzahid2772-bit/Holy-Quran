import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { QuranReader } from './components/QuranReader';
import { BookmarksScreen } from './components/BookmarksScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { DesktopNavbar } from './components/DesktopNavbar';
import { NavigationModal } from './components/NavigationModal';
import { TajweedLegendModal } from './components/TajweedLegendModal';
import { QuranStatsModal } from './components/QuranStatsModal';
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
      if (p >= 1 && p <= 559) return p;
    } catch (e) {}
    return readingProgress.lastPageNumber || 2;
  };

  const [currentPage, setCurrentPage] = useState<number>(getInitialPage());
  const [settings, setSettings] = useState<AppSettings>(QuranDataService.getSettings());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(QuranDataService.getBookmarks());
  
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [navInitialTab, setNavInitialTab] = useState<'surahs' | 'juz' | 'pages'>('surahs');
  const [isTajweedModalOpen, setIsTajweedModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

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
    const clamped = Math.max(1, Math.min(559, newPage));
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
  const handleOpenNavigation = (tab: 'surahs' | 'juz' | 'pages') => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors flex flex-col">
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
      />

      {/* Active Screen View */}
      {activeTab === 'home' && (
        <HomeScreen
          readingProgress={readingProgress}
          onOpenQuran={handleOpenQuran}
          onOpenNavigation={handleOpenNavigation}
          onOpenTajweedLegend={() => setIsTajweedModalOpen(true)}
          onOpenBookmarks={() => setActiveTab('bookmarks')}
          onOpenQuranStatistics={() => setIsStatsModalOpen(true)}
        />
      )}

      {activeTab === 'quran' && (
        <QuranReader
          currentPage={currentPage}
          onPageChange={handlePageChange}
          theme={settings.theme}
          showStatisticsSetting={settings.showPageStatistics}
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

      {/* Bottom Navigation (Always accessible unless distraction-free in Quran reader) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'bookmarks') {
            setBookmarks(QuranDataService.getBookmarks());
          }
        }}
      />
    </div>
  );
}

export default App;
