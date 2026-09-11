import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Bookmark as BookmarkIcon,
  Compass,
  Palette,
  Eye,
  Maximize2,
  Minimize2,
  FileText,
  BookOpen,
  BarChart2
} from 'lucide-react';
import { QuranDataService } from '../database/quranDataService';
import { PageStatisticsPanel } from './PageStatisticsPanel';
import { WordDetailsModal } from './WordDetailsModal';
import { TajweedLegendModal } from './TajweedLegendModal';
import { NavigationModal } from './NavigationModal';
import { PageDetailsModal } from './PageDetailsModal';
import { DesktopSidebar } from './DesktopSidebar';
import { QuranPage } from './QuranPage';
import { QuranPageData, QuranWordData, PageStatistics, Bookmark } from '../types/quran';

interface QuranReaderProps {
  currentPage: number;
  onPageChange: (newPage: number) => void;
  theme: 'light' | 'warm-paper' | 'dark' | 'emerald';
  showStatisticsSetting: boolean;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  currentPage,
  onPageChange,
  theme,
  showStatisticsSetting,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [distractionFree, setDistractionFree] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showStatisticsPanel, setShowStatisticsPanel] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<QuranWordData | null>(null);
  const [isTajweedModalOpen, setIsTajweedModalOpen] = useState<boolean>(false);
  const [isNavModalOpen, setIsNavModalOpen] = useState<boolean>(false);
  const [isPageDetailsModalOpen, setIsPageDetailsModalOpen] = useState<boolean>(false);
  
  // Desktop Layout States: View Mode & Sidebar
  const [viewMode, setViewMode] = useState<'single' | 'dual'>(() => {
    try {
      const saved = localStorage.getItem('quran_view_mode');
      if (saved === 'dual' || saved === 'single') return saved;
      return typeof window !== 'undefined' && window.innerWidth >= 1200 ? 'dual' : 'single';
    } catch {
      return 'single';
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [detailsPageNumber, setDetailsPageNumber] = useState<number>(currentPage);

  // Determine Pair of Pages for Desktop Dual-Page Mode (16-line Mushaf spread)
  // Page 1 is introductory cover. For pages 2-559:
  // Even pages (2, 4, 6...) are Right-Hand pages in Arabic RTL
  // Odd pages (3, 5, 7...) are Left-Hand pages in Arabic RTL
  const rightPageNumber = currentPage === 1 ? 1 : (currentPage % 2 === 0 ? currentPage : currentPage - 1);
  const leftPageNumber = currentPage === 1 ? null : (rightPageNumber + 1 <= 559 ? rightPageNumber + 1 : null);

  // Digital Quran state for Right and Left pages
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [leftPageData, setLeftPageData] = useState<QuranPageData | null>(null);
  const [statistics, setStatistics] = useState<PageStatistics | null>(null);
  const [leftStatistics, setLeftStatistics] = useState<PageStatistics | null>(null);
  const [loadingPage, setLoadingPage] = useState<boolean>(true);
  
  // Optional Reference Scan Comparison Toggle
  const [showPdfReference, setShowPdfReference] = useState<boolean>(false);
  const [refImageLoaded, setRefImageLoaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const surah = QuranDataService.getSurahForPage(rightPageNumber);
  const leftSurah = leftPageNumber ? QuranDataService.getSurahForPage(leftPageNumber) : null;
  const juz = QuranDataService.getJuzForPage(rightPageNumber);
  const leftJuz = leftPageNumber ? QuranDataService.getJuzForPage(leftPageNumber) : null;
  const refImagePath = QuranDataService.getPageImagePath(currentPage);

  // Load Digital Page Data and Page Statistics whenever page or viewMode changes
  useEffect(() => {
    let isCancelled = false;
    setLoadingPage(true);
    setRefImageLoaded(false);

    setIsBookmarked(QuranDataService.isPageBookmarked(currentPage));
    QuranDataService.saveReadingProgress(currentPage);

    // 1. Fetch Primary / Right Page Data & Stats
    const activeRightPage = viewMode === 'dual' ? rightPageNumber : currentPage;
    QuranDataService.getPageData(activeRightPage)
      .then((data) => {
        if (!isCancelled) {
          setPageData(data);
          setLoadingPage(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching right page data:', err);
        if (!isCancelled) setLoadingPage(false);
      });

    QuranDataService.getPageStatistics(activeRightPage)
      .then((stats) => {
        if (!isCancelled) {
          setStatistics(stats);
        }
      })
      .catch((err) => {
        console.error('Error fetching right page stats:', err);
      });

    // 2. If Dual Mode, fetch Left Page Data & Stats
    if (viewMode === 'dual' && leftPageNumber) {
      QuranDataService.getPageData(leftPageNumber)
        .then((data) => {
          if (!isCancelled) {
            setLeftPageData(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching left page data:', err);
        });

      QuranDataService.getPageStatistics(leftPageNumber)
        .then((stats) => {
          if (!isCancelled) {
            setLeftStatistics(stats);
          }
        })
        .catch((err) => {
          console.error('Error fetching left page stats:', err);
        });
    } else {
      setLeftPageData(null);
      setLeftStatistics(null);
    }

    // Preload next and previous pages for instant transitions
    if (currentPage < 558) {
      QuranDataService.getPageData(currentPage + 1).catch(() => {});
      QuranDataService.getPageData(currentPage + 2).catch(() => {});
    }
    if (currentPage > 2) {
      QuranDataService.getPageData(currentPage - 1).catch(() => {});
      QuranDataService.getPageData(currentPage - 2).catch(() => {});
    }

    return () => {
      isCancelled = true;
    };
  }, [currentPage, viewMode, rightPageNumber, leftPageNumber]);

  const goToNextPage = () => {
    if (viewMode === 'dual' && currentPage >= 2) {
      const next = rightPageNumber + 2;
      if (next <= 559) {
        onPageChange(next);
      }
    } else {
      if (currentPage < 559) {
        onPageChange(currentPage + 1);
      }
    }
  };

  const goToPrevPage = () => {
    if (viewMode === 'dual' && currentPage >= 2) {
      if (rightPageNumber <= 2) {
        onPageChange(1);
      } else {
        onPageChange(Math.max(2, rightPageNumber - 2));
      }
    } else {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    }
  };

  // Enhanced Desktop Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in search or jump input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      // In Arabic RTL: Left arrow = Next page, Right arrow = Previous page
      if (e.key === 'ArrowLeft' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === '1') {
        setViewMode('single');
        try { localStorage.setItem('quran_view_mode', 'single'); } catch {}
      } else if (e.key === '2') {
        setViewMode('dual');
        try { localStorage.setItem('quran_view_mode', 'dual'); } catch {}
      } else if (e.key.toLowerCase() === 'd') {
        setDetailsPageNumber(currentPage);
        setIsPageDetailsModalOpen(true);
      } else if (e.key.toLowerCase() === 't') {
        setIsTajweedModalOpen(true);
      } else if (e.key.toLowerCase() === 'b') {
        handleToggleBookmark();
      } else if (e.key.toLowerCase() === 's') {
        setIsSidebarOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setDistractionFree(false);
        setZoom(1);
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, viewMode, rightPageNumber, leftPageNumber]);

  const handleToggleBookmark = () => {
    const newState = QuranDataService.toggleBookmark(currentPage);
    setIsBookmarked(newState);
  };

  const toggleViewMode = () => {
    const next = viewMode === 'single' ? 'dual' : 'single';
    setViewMode(next);
    try {
      localStorage.setItem('quran_view_mode', next);
    } catch {}
  };

  // Zoom controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.15, 2.2));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.15, 0.85));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
  };

  // Touch Swipe for mobile (RTL: swipe left moves to next page, swipe right moves to previous)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;

    // Minimum swipe threshold 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
  };

  // Word selection handler from Digital 16-line page
  const handleSelectWord = (word: QuranWordData) => {
    setSelectedWord(word);
  };

  // Theme styling classes
  const themeBgClasses = {
    light: 'bg-gray-100 text-gray-900',
    'warm-paper': 'bg-[#f4eedb] text-amber-950',
    dark: 'bg-gray-950 text-gray-100',
    emerald: 'bg-[#032219] text-emerald-100',
  }[theme];

  return (
    <div
      className={`min-h-screen flex flex-col select-none transition-colors duration-300 ${themeBgClasses}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Controls (Collapsible in distraction-free mode) */}
      {!distractionFree && (
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/80 dark:border-gray-800/80 backdrop-blur-md px-3 py-2.5 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            {/* Left: Surah & Juz Information */}
            <button
              onClick={() => setIsNavModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-right"
            >
              <Compass size={18} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="font-bold font-quran text-gray-900 dark:text-gray-100 text-base leading-none">
                  {surah ? surah.nameArabic : 'سرورق / فہرست'}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-sans">
                  {juz ? `پارہ ${juz.number}` : ''} • صفحہ {currentPage}
                </div>
              </div>
            </button>

            {/* Center: Quick Zoom & Distraction Free toggles */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl">
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                title="زوم بڑھائیں (Zoom In)"
              >
                <ZoomIn size={16} />
              </button>
              {zoom !== 1 && (
                <button
                  onClick={handleResetZoom}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-gray-700 rounded transition-colors font-sans"
                >
                  {Math.round(zoom * 100)}%
                </button>
              )}
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                title="زوم کم کریں (Zoom Out)"
              >
                <ZoomOut size={16} />
              </button>
            </div>

            {/* Right: Actions (View Mode, Sidebar, Reference PDF, Details, Tajweed, Bookmark, Fullscreen) */}
            <div className="flex items-center gap-1">
              {/* Desktop Two-Page Spread Mode Toggle (Book View) */}
              <button
                onClick={toggleViewMode}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'dual'
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-gold-200 border border-emerald-300 dark:border-emerald-700 shadow-sm font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={viewMode === 'dual' ? 'ایک صفحہ پر سوئچ کریں (Switch to Single Page)' : 'دو صفحات کتابی منظر پر سوئچ کریں (Switch to Two-Page Book View)'}
              >
                <BookOpen size={15} className="text-emerald-700 dark:text-gold-300" />
                <span>{viewMode === 'dual' ? '۲ صفحات' : '۱ صفحہ'}</span>
              </button>

              {/* Desktop Quick Browse Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className={`hidden lg:flex p-2 rounded-xl transition-colors cursor-pointer ${
                  isSidebarOpen
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-gold-200'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                title="فہرست و نیویگیشن سائیڈ بار کھولیں / بند کریں"
              >
                <Compass size={18} />
              </button>

              {/* Optional PDF Reference comparison toggle */}
              <button
                onClick={() => setShowPdfReference((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors ${
                  showPdfReference
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                title={showPdfReference ? 'ڈیجیٹل مصحف پر واپس آئیں' : 'ریفرنس پی ڈی ایف چیک کریں (Reference Scan)'}
              >
                <FileText size={18} />
              </button>

              <button
                onClick={() => setIsPageDetailsModalOpen(true)}
                className="p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                title="صفحہ کی تفصیلات (اعراب، حروف، تجوید)"
              >
                <BarChart2 size={18} />
              </button>

              <button
                onClick={() => setIsTajweedModalOpen(true)}
                className="p-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition-colors"
                title="تجویدی کلر گائیڈ"
              >
                <Palette size={18} />
              </button>

              <button
                onClick={handleToggleBookmark}
                className={`p-2 rounded-xl transition-colors ${
                  isBookmarked
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
                title={isBookmarked ? 'بک مارک ختم کریں' : 'بک مارک محفوظ کریں'}
              >
                <BookmarkIcon size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => setDistractionFree(true)}
                className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-colors"
                title="پورا صفحہ دیکھیں (Distraction-free)"
              >
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Quran Reading Canvas Area */}
      <main
        ref={containerRef}
        className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-auto relative"
      >
        {/* Floating Distraction-Free Exit Button */}
        {distractionFree && (
          <button
            onClick={() => setDistractionFree(false)}
            className="fixed top-4 right-4 z-40 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all shadow-lg animate-fade-in"
            title="کنٹرولز دکھائیں"
          >
            <Minimize2 size={18} />
          </button>
        )}

        {/* Floating Page Number indicator in Distraction-free */}
        {distractionFree && (
          <div className="fixed top-4 left-4 z-40 px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-full backdrop-blur-md pointer-events-none font-sans">
            صفحہ {currentPage}
          </div>
        )}

        {/* Mode Indicator Banner (when PDF reference toggle is active) */}
        {showPdfReference && (
          <div className="mb-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
            <FileText size={14} />
            <span>ریفرنس ویو: اصل Quran.pdf کا اسکین موازنہ کے لیے</span>
            <button
              onClick={() => setShowPdfReference(false)}
              className="underline text-amber-800 dark:text-amber-300 ml-1 font-bold"
            >
              (ڈیجیٹل متن پر واپس جائیں)
            </button>
          </div>
        )}

        {/* Quran Reading Container with Zoom */}
        <div
          className={`w-full ${
            viewMode === 'dual' ? 'max-w-[1580px]' : 'max-w-[780px]'
          } mx-auto transition-transform duration-200`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {loadingPage ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-gray-400 animate-pulse">
              <BookOpen size={36} className="text-emerald-600 dark:text-emerald-400 mb-3 animate-bounce" />
              <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                صفحہ {currentPage} لوڈ ہو رہا ہے...
              </div>
              <div className="text-xs text-gray-400 mt-1 font-sans">
                Authentic 16-Line Tajweed Engine
              </div>
            </div>
          ) : showPdfReference ? (
            /* Reference PDF Comparison Scan */
            <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white border border-gray-200 max-w-[780px] mx-auto">
              <img
                src={refImagePath}
                alt={`Reference PDF Page ${currentPage}`}
                onLoad={() => setRefImageLoaded(true)}
                className={`w-full h-auto object-contain transition-opacity duration-300 ${
                  refImageLoaded ? 'opacity-100' : 'opacity-0 min-h-[500px]'
                }`}
              />
              {!refImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 min-h-[500px]">
                  <span className="text-xs text-gray-500">ریفرنس اسکین لوڈ ہو رہا ہے...</span>
                </div>
              )}
            </div>
          ) : pageData?.isQuranText ? (
            /* Authentic Digital 16-Line Tajweed Mushaf */
            viewMode === 'dual' && leftPageNumber && leftPageData?.isQuranText ? (
              /* Desktop Two-Page Book Spread (Right Page + Open Spine + Left Page) */
              <div
                className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6"
                dir="rtl"
              >
                {/* Right Page (Earlier Page in RTL, e.g. Page 2) */}
                <div className="w-full lg:flex-1 max-w-[760px]">
                  <QuranPage
                    pageData={pageData}
                    pageNumber={rightPageNumber}
                    surah={surah}
                    juz={juz}
                    onSelectWord={handleSelectWord}
                    selectedWordId={selectedWord?.id}
                    onOpenPageDetails={() => {
                      setDetailsPageNumber(rightPageNumber);
                      setIsPageDetailsModalOpen(true);
                    }}
                  />
                </div>

                {/* Islamic Open Spine Center Crease Divider */}
                {leftPageNumber && (
                  <div className="hidden lg:flex flex-col items-center justify-center self-stretch py-6 select-none opacity-40">
                    <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-gold-500 to-transparent"></div>
                  </div>
                )}

                {/* Left Page (Next Page in RTL, e.g. Page 3) */}
                {leftPageNumber && (
                  <div className="w-full lg:flex-1 max-w-[760px]">
                    <QuranPage
                      pageData={leftPageData}
                      pageNumber={leftPageNumber}
                      surah={leftSurah}
                      juz={leftJuz}
                      onSelectWord={handleSelectWord}
                      selectedWordId={selectedWord?.id}
                      onOpenPageDetails={() => {
                        setDetailsPageNumber(leftPageNumber);
                        setIsPageDetailsModalOpen(true);
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Single Page Mode (Mobile, Tablet, or User Chosen Single View) */
              <QuranPage
                pageData={pageData}
                pageNumber={currentPage}
                surah={surah}
                juz={juz}
                onSelectWord={handleSelectWord}
                selectedWordId={selectedWord?.id}
                onOpenPageDetails={() => {
                  setDetailsPageNumber(currentPage);
                  setIsPageDetailsModalOpen(true);
                }}
              />
            )
          ) : (
            /* Introductory / Title / Index / Khatm Pages (e.g. Page 1 or 550-559) */
            <div className="p-8 my-4 rounded-2xl bg-[#fffefc] dark:bg-emerald-950/80 border-2 border-gold-500/50 shadow-xl text-center">
              <div className="max-w-md mx-auto py-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-800 dark:text-emerald-200 mb-4 shadow-sm">
                  <Compass size={32} />
                </div>
                <h3 className="text-xl font-bold font-quran text-gray-900 dark:text-gold-200 mb-2">
                  {currentPage === 1 ? 'قرآنِ مجید ۱۶ سطری تجویدی مصحف' : `صفحہ ${currentPage} - دعائے ختم القرآن و قواعد`}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {currentPage === 1
                    ? 'یہ مصحفِ مبارک کا افتتاحی سرورق ہے۔ تلاوت کا آغاز سورۃ الفاتحہ (صفحہ ۲) سے کریں۔'
                    : 'اس صفحہ پر دعائے ختم القرآن، تجوید کے قواعد اور فہرست موجود ہے۔ آپ ریفرنس اسکین بھی ملاحظہ کر سکتے ہیں۔'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {currentPage === 1 ? (
                    <button
                      onClick={() => onPageChange(2)}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      سورۃ الفاتحہ شروع کریں (صفحہ ۲)
                    </button>
                  ) : (
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      پچھلا صفحہ (صفحہ {currentPage - 1})
                    </button>
                  )}
                  <button
                    onClick={() => setShowPdfReference(true)}
                    className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl font-medium text-xs transition-colors"
                  >
                    ریفرنس پی ڈی ایف دیکھیں
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Page Navigation Floating Arrows for Touch / Desktop */}
      {!distractionFree && (
        <div className="fixed bottom-20 left-0 right-0 z-20 pointer-events-none">
          <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
            {/* Next Page Button (Left in RTL is Next Page) */}
            <button
              onClick={goToNextPage}
              disabled={currentPage >= 559}
              className={`p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg pointer-events-auto border border-gray-200/80 dark:border-gray-700 transition-all active:scale-95 ${
                currentPage >= 559
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
              }`}
              title="اگلا صفحہ (Next Page)"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Previous Page Button (Right in RTL is Previous Page) */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`p-3 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg pointer-events-auto border border-gray-200/80 dark:border-gray-700 transition-all active:scale-95 ${
                currentPage <= 1
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
              }`}
              title="پچھلا صفحہ (Previous Page)"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Page Statistics Drawer */}
      {(showStatisticsSetting || showStatisticsPanel) && statistics && (
        <div className="sticky bottom-0 z-30">
          <PageStatisticsPanel
            statistics={statistics}
            isOpen={showStatisticsPanel}
            onToggle={() => setShowStatisticsPanel((prev) => !prev)}
            pageNumber={currentPage}
          />
        </div>
      )}

      {/* Word Details Modal Popup */}
      <WordDetailsModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        onJumpToOccurrence={(page) => onPageChange(page)}
      />

      {/* Full Page Details Modal (Zabar, Zer, Pesh, Heavy Letters, Qalqalah, etc.) */}
      <PageDetailsModal
        isOpen={isPageDetailsModalOpen}
        onClose={() => setIsPageDetailsModalOpen(false)}
        statistics={detailsPageNumber === rightPageNumber ? statistics : (leftStatistics || statistics)}
        pageNumber={detailsPageNumber}
        surah={QuranDataService.getSurahForPage(detailsPageNumber)}
        juz={QuranDataService.getJuzForPage(detailsPageNumber)}
      />

      {/* Tajweed Legend Modal */}
      <TajweedLegendModal
        isOpen={isTajweedModalOpen}
        onClose={() => setIsTajweedModalOpen(false)}
      />

      {/* Navigation Modal (Surahs, Paras, Page Jump) */}
      <NavigationModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        onSelectPage={(p) => onPageChange(p)}
        currentPage={currentPage}
      />

      {/* Desktop Quick Browse Sidebar (Surahs, Paras, Bookmarks) */}
      <DesktopSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        currentPage={currentPage}
        onSelectPage={(p) => {
          onPageChange(p);
          if (typeof window !== 'undefined' && window.innerWidth < 1280) {
            setIsSidebarOpen(false);
          }
        }}
        bookmarks={QuranDataService.getBookmarks()}
      />
    </div>
  );
};
