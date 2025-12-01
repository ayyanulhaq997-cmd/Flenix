import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { TVHeader } from '@/components/tv/TVHeader';
import { TVHero } from '@/components/tv/TVHero';
import { TVNavigationTabs } from '@/components/tv/TVNavigationTabs';
import { TVContentRow } from '@/components/tv/TVContentRow';
import { useTVNavigation } from '@/hooks/useTVNavigation';

interface ContentItem {
  id: string | number;
  title: string;
  year?: number;
  posterUrl?: string;
  progress?: number;
  description?: string;
  genre?: string;
  duration?: number;
}

interface NavigationState {
  tab: number;
  rowIndex: number;
  colIndex: number;
}

// Mock data
const mockMovies: ContentItem[] = [
  { id: 1, title: "Avengers: Doomsday", year: 2026, progress: 45 },
  { id: 2, title: "Black Panther: Wakanda Forever", year: 2024, progress: 20 },
  { id: 3, title: "Thor: Love and Thunder", year: 2024, progress: 0 },
  { id: 4, title: "Doctor Strange", year: 2022, progress: 85 },
  { id: 5, title: "Guardians of the Galaxy", year: 2023, progress: 100 },
  { id: 6, title: "Spider-Man: No Way Home", year: 2023, progress: 60 },
  { id: 7, title: "The Marvels", year: 2023, progress: 30 },
  { id: 8, title: "Captain America: Brave New World", year: 2025, progress: 0 },
];

const mockSeries: ContentItem[] = [
  { id: 101, title: "Loki", year: 2023 },
  { id: 102, title: "WandaVision", year: 2021 },
  { id: 103, title: "The Falcon and the Winter Soldier", year: 2021 },
  { id: 104, title: "Moon Knight", year: 2022 },
  { id: 105, title: "She-Hulk", year: 2022 },
  { id: 106, title: "Ms. Marvel", year: 2022 },
];

const mockChannels: ContentItem[] = [
  { id: 201, title: "HBO Max", year: 2024 },
  { id: 202, title: "Netflix", year: 2024 },
  { id: 203, title: "Disney+", year: 2024 },
  { id: 204, title: "ESPN", year: 2024 },
];

const TABS = [
  { id: 'resume', label: 'RESUMEN' },
  { id: 'movies', label: 'PELÍCULAS' },
  { id: 'series', label: 'SERIES' },
  { id: 'channels', label: 'CANALES TV' },
  { id: 'search', label: 'BUSCAR' },
];

export default function TVHome() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [focusedElement, setFocusedElement] = useState<'header' | 'hero' | 'tab' | 'row' | 'search'>('row');
  const [focusedTabIndex, setFocusedTabIndex] = useState(0);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedColIndex, setFocusedColIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const keyPressTimeRef = useRef<Record<string, number>>({});
  const fastScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Navigate to content details
  const navigateToContent = (item: ContentItem) => {
    sessionStorage.setItem(`content_${item.id}`, JSON.stringify(item));
    sessionStorage.setItem('last_nav', JSON.stringify({
      tab: activeTab,
      rowIndex: focusedRowIndex,
      colIndex: focusedColIndex,
    }));
    setLocation(`/tv/details?id=${item.id}`);
  };

  // Handle keyboard navigation with fast-scroll support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      keyPressTimeRef.current[e.key] = now;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusedElement === 'row') {
            setFocusedElement('tab');
            setFocusedRowIndex(0);
            setFocusedColIndex(0);
          } else if (focusedElement === 'tab') {
            setFocusedElement('hero');
            setFocusedTabIndex(0);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (focusedElement === 'hero') {
            setFocusedElement('tab');
          } else if (focusedElement === 'tab') {
            setFocusedElement('row');
            setFocusedRowIndex(0);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (focusedElement === 'tab') {
            const newTabIndex = Math.max(0, focusedTabIndex - 1);
            setFocusedTabIndex(newTabIndex);
            setActiveTab(newTabIndex);
          } else if (focusedElement === 'row') {
            setFocusedColIndex(Math.max(0, focusedColIndex - 1));
          }
          // Start fast-scroll on hold
          if (!fastScrollIntervalRef.current) {
            let scrollSpeed = 0;
            fastScrollIntervalRef.current = setInterval(() => {
              scrollSpeed++;
              if (scrollSpeed > 5 && focusedElement === 'row') {
                setFocusedColIndex(prev => Math.max(0, prev - 1));
              }
            }, 100);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (focusedElement === 'tab') {
            const newTabIndex = Math.min(TABS.length - 1, focusedTabIndex + 1);
            setFocusedTabIndex(newTabIndex);
            setActiveTab(newTabIndex);
          } else if (focusedElement === 'row') {
            const maxItems = getActiveRowData().length;
            setFocusedColIndex(Math.min(maxItems - 1, focusedColIndex + 1));
          }
          // Start fast-scroll on hold
          if (!fastScrollIntervalRef.current) {
            let scrollSpeed = 0;
            fastScrollIntervalRef.current = setInterval(() => {
              scrollSpeed++;
              if (scrollSpeed > 5 && focusedElement === 'row') {
                setFocusedColIndex(prev => Math.min(getActiveRowData().length - 1, prev + 1));
              }
            }, 100);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (focusedElement === 'tab') {
            // Tab already switches on focus change
          } else if (focusedElement === 'row') {
            const item = getActiveRowData()[focusedColIndex];
            if (item) navigateToContent(item);
          } else if (focusedElement === 'hero') {
            const heroItem = getActiveRowData()[0];
            if (heroItem) navigateToContent(heroItem);
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (searchMode) {
            setSearchMode(false);
            setSearchQuery('');
          } else {
            setShowExitDialog(true);
          }
          break;

        case '/':
          // Quick search activation (/ key)
          if (!searchMode) {
            e.preventDefault();
            setSearchMode(true);
            setActiveTab(4);
            setFocusedElement('search');
            setFocusedRowIndex(0);
            setFocusedColIndex(0);
          }
          break;

        default:
          // Type characters for search when in search mode
          if (searchMode && e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
            setSearchQuery(prev => prev + e.key);
          } else if (searchMode && e.key === 'Backspace') {
            e.preventDefault();
            setSearchQuery(prev => prev.slice(0, -1));
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (fastScrollIntervalRef.current) {
          clearInterval(fastScrollIntervalRef.current);
          fastScrollIntervalRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (fastScrollIntervalRef.current) clearInterval(fastScrollIntervalRef.current);
    };
  }, [focusedElement, focusedTabIndex, focusedColIndex, focusedRowIndex, activeTab, setLocation]);

  function getActiveRowData(): ContentItem[] {
    switch (TABS[activeTab]?.id) {
      case 'movies':
        return mockMovies;
      case 'series':
        return mockSeries;
      case 'channels':
        return mockChannels;
      default:
        return mockMovies;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <TVHeader isFocused={focusedElement === 'header'} />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <TVHero
          title={getActiveRowData()[0]?.title || "Avengers Doomsday"}
          genres={["Acción", "Aventura", "Ciencia Ficción"]}
          summary="Un equipo de superhéroes se reúne para salvar el mundo de una amenaza intergaláctica que amenaza la existencia de todos."
          isFocused={focusedElement === 'hero'}
          onPlay={() => console.log('Play clicked')}
          onMoreInfo={() => console.log('More info clicked')}
        />

        {/* Navigation Tabs */}
        <TVNavigationTabs
          tabs={TABS}
          activeTab={activeTab}
          focusedTabIndex={focusedElement === 'tab' ? focusedTabIndex : -1}
          onTabChange={(index) => {
            setActiveTab(index);
            setFocusedTabIndex(index);
            setFocusedElement('tab');
          }}
        />

        {/* Content Rows */}
        <div className="space-y-8 pb-16">
          {activeTab === 0 && (
            <>
              <TVContentRow
                title="CONTINUAR VIENDO"
                items={mockMovies.filter(m => m.progress! > 0 && m.progress! < 100)}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 0 ? focusedColIndex : -1}
                rowIndex={0}
                onItemClick={navigateToContent}
              />
              <TVContentRow
                title="PELÍCULAS POPULARES"
                items={mockMovies}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 1 ? focusedColIndex : -1}
                rowIndex={1}
                onItemClick={navigateToContent}
              />
              <TVContentRow
                title="SERIES RECOMENDADAS"
                items={mockSeries}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 2 ? focusedColIndex : -1}
                rowIndex={2}
                onItemClick={navigateToContent}
              />
            </>
          )}

          {activeTab === 1 && (
            <TVContentRow
              title="PELÍCULAS"
              items={mockMovies}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={navigateToContent}
            />
          )}

          {activeTab === 2 && (
            <TVContentRow
              title="SERIES"
              items={mockSeries}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={navigateToContent}
            />
          )}

          {activeTab === 3 && (
            <TVContentRow
              title="CANALES TV"
              items={mockChannels}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={navigateToContent}
            />
          )}
        </div>
      </main>

      {/* Exit Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-6">¿Salir de la aplicación?</h2>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setShowExitDialog(false)}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
                data-testid="button-cancel-exit"
              >
                Cancelar
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition-all"
                data-testid="button-confirm-exit"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info - Remove in production */}
      <div className="fixed bottom-4 right-4 bg-black/80 border border-red-500 p-3 rounded text-xs text-gray-400">
        <p>Focus: {focusedElement} | Tab: {activeTab} | Row: {focusedRowIndex} | Col: {focusedColIndex}</p>
        <p className="text-xs text-gray-500 mt-2">Use Arrow Keys + Enter to navigate</p>
      </div>
    </div>
  );
}
