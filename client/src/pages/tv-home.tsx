import { useState, useEffect } from 'react';
import { TVHeader } from '@/components/tv/TVHeader';
import { TVHero } from '@/components/tv/TVHero';
import { TVNavigationTabs } from '@/components/tv/TVNavigationTabs';
import { TVContentRow } from '@/components/tv/TVContentRow';
import { useTVNavigation } from '@/hooks/useTVNavigation';

interface ContentItem {
  id: string | number;
  title: string;
  year: number;
  posterUrl?: string;
  progress?: number;
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
];

export default function TVHome() {
  const [activeTab, setActiveTab] = useState(0);
  const [focusedElement, setFocusedElement] = useState<'header' | 'hero' | 'tab' | 'row'>('row');
  const [focusedTabIndex, setFocusedTabIndex] = useState(0);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [focusedColIndex, setFocusedColIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // D-pad navigation
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          // Navigate from rows -> tabs -> hero
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
          // Navigate from hero -> tabs -> rows
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
          break;

        case 'Enter':
          e.preventDefault();
          if (focusedElement === 'tab') {
            // Tab already switches on focus change
          } else if (focusedElement === 'row') {
            const item = getActiveRowData()[focusedColIndex];
            if (item) {
              console.log('Selected item:', item);
              // TODO: Navigate to detail page
            }
          } else if (focusedElement === 'hero') {
            console.log('Play hero content');
          }
          break;

        case 'Escape':
          // Back button - reset focus to row
          e.preventDefault();
          setFocusedElement('row');
          setFocusedTabIndex(0);
          setFocusedRowIndex(0);
          setFocusedColIndex(0);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedElement, focusedTabIndex, focusedColIndex, focusedRowIndex]);

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
                onItemClick={(item) => console.log('Clicked:', item)}
              />
              <TVContentRow
                title="PELÍCULAS POPULARES"
                items={mockMovies}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 1 ? focusedColIndex : -1}
                rowIndex={1}
                onItemClick={(item) => console.log('Clicked:', item)}
              />
              <TVContentRow
                title="SERIES RECOMENDADAS"
                items={mockSeries}
                focusedCol={focusedElement === 'row' && focusedRowIndex === 2 ? focusedColIndex : -1}
                rowIndex={2}
                onItemClick={(item) => console.log('Clicked:', item)}
              />
            </>
          )}

          {activeTab === 1 && (
            <TVContentRow
              title="PELÍCULAS"
              items={mockMovies}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={(item) => console.log('Clicked:', item)}
            />
          )}

          {activeTab === 2 && (
            <TVContentRow
              title="SERIES"
              items={mockSeries}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={(item) => console.log('Clicked:', item)}
            />
          )}

          {activeTab === 3 && (
            <TVContentRow
              title="CANALES TV"
              items={mockChannels}
              focusedCol={focusedElement === 'row' ? focusedColIndex : -1}
              rowIndex={0}
              onItemClick={(item) => console.log('Clicked:', item)}
            />
          )}
        </div>
      </main>

      {/* Debug Info - Remove in production */}
      <div className="fixed bottom-4 right-4 bg-black/80 border border-red-500 p-3 rounded text-xs text-gray-400">
        <p>Focus: {focusedElement} | Tab: {activeTab} | Row: {focusedRowIndex} | Col: {focusedColIndex}</p>
        <p className="text-xs text-gray-500 mt-2">Use Arrow Keys + Enter to navigate</p>
      </div>
    </div>
  );
}
