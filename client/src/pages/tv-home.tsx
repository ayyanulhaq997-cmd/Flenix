import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { TVHeader } from '@/components/tv/TVHeader';
import { TVHero } from '@/components/tv/TVHero';
import { TVNavigationTabs } from '@/components/tv/TVNavigationTabs';
import { TVContentRow } from '@/components/tv/TVContentRow';
import { useTVNavigation } from '@/hooks/useTVNavigation';
import axios from 'axios';

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

// Fetch functions for real data from API
const fetchMovies = async (): Promise<ContentItem[]> => {
  const { data } = await axios.get('/api/movies');
  return Array.isArray(data) ? data : [];
};

const fetchSeries = async (): Promise<ContentItem[]> => {
  const { data } = await axios.get('/api/series');
  return Array.isArray(data) ? data : [];
};

const fetchChannels = async (): Promise<ContentItem[]> => {
  const { data } = await axios.get('/api/channels');
  return Array.isArray(data) ? data : [];
};

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

  // Fetch real data from API
  const { data: moviesData = [] } = useQuery({
    queryKey: ['movies'],
    queryFn: fetchMovies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: seriesData = [] } = useQuery({
    queryKey: ['series'],
    queryFn: fetchSeries,
    staleTime: 5 * 60 * 1000,
  });

  const { data: channelsData = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
    staleTime: 5 * 60 * 1000,
  });

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

  // Skip details page and play directly
  const playContentDirectly = (item: ContentItem) => {
    sessionStorage.setItem(`content_${item.id}`, JSON.stringify(item));
    sessionStorage.setItem('last_nav', JSON.stringify({
      tab: activeTab,
      rowIndex: focusedRowIndex,
      colIndex: focusedColIndex,
    }));
    setLocation(`/tv/details?id=${item.id}&autoplay=true`);
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
  }, [focusedElement, focusedTabIndex, focusedColIndex, focusedRowIndex, activeTab, setLocation, moviesData, seriesData, channelsData]);

  function getActiveRowData(): ContentItem[] {
    try {
      switch (TABS[activeTab]?.id) {
        case 'movies':
          return moviesData || [];
        case 'series':
          return seriesData || [];
        case 'channels':
          return channelsData || [];
        default:
          return moviesData || [];
      }
    } catch (error) {
      console.error('Error in getActiveRowData:', error);
      return [];
    }
  }

  function getSearchResults(): ContentItem[] {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const allContent = [...moviesData, ...seriesData, ...channelsData];
    return allContent.filter(item => 
      item.title.toLowerCase().includes(query)
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <TVHeader isFocused={focusedElement === 'header'} />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        {getActiveRowData()[0] && (
          <TVHero
            title={getActiveRowData()[0]?.title || "Avengers Doomsday"}
            genres={getActiveRowData()[0]?.genre ? [getActiveRowData()[0].genre] : ["Acción", "Aventura"]}
            summary={getActiveRowData()[0]?.description || "Un equipo de superhéroes se reúne para salvar el mundo de una amenaza intergaláctica que amenaza la existencia de todos."}
            backgroundImage={getActiveRowData()[0]?.posterUrl}
            isFocused={focusedElement === 'hero'}
            onPlay={() => playContentDirectly(getActiveRowData()[0])}
            onMoreInfo={() => navigateToContent(getActiveRowData()[0])}
          />
        )}

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
                items={moviesData.filter(m => m.progress! > 0 && m.progress! < 100)}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 0 ? focusedColIndex : -1}
                rowIndex={0}
                onItemClick={navigateToContent}
              />
              <TVContentRow
                title="PELÍCULAS POPULARES"
                items={moviesData}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 1 ? focusedColIndex : -1}
                rowIndex={1}
                onItemClick={navigateToContent}
              />
              <TVContentRow
                title="SERIES RECOMENDADAS"
                items={seriesData}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 2 ? focusedColIndex : -1}
                rowIndex={2}
                onItemClick={navigateToContent}
              />
            </>
          )}

          {activeTab === 1 && (
            <TVContentRow
              title="PELÍCULAS"
              items={moviesData}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={navigateToContent}
            />
          )}

          {activeTab === 2 && (
            <TVContentRow
              title="SERIES"
              items={seriesData}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={navigateToContent}
            />
          )}

          {activeTab === 3 && (
            <TVContentRow
              title="CANALES TV"
              items={channelsData}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={navigateToContent}
            />
          )}

          {activeTab === 4 && (
            <TVContentRow
              title={searchQuery ? `RESULTADOS: ${searchQuery.toUpperCase()}` : 'INGRESE UN TÉRMINO DE BÚSQUEDA'}
              items={getSearchResults()}
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
