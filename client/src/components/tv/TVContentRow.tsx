import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ContentItem {
  id: string | number;
  title: string;
  year?: number;
  posterUrl?: string;
  progress?: number; // 0-100 for "Continue Watching"
}

interface TVContentRowProps {
  title: string;
  items: ContentItem[];
  focusedCol?: number;
  rowIndex?: number;
  onItemClick?: (item: ContentItem) => void;
}

/**
 * Netflix-style carousel snapping component
 * Features:
 * - Smooth calculated translation (snap behavior)
 * - Hidden horizontal scrollbar
 * - Fixed-window TV app carousel
 * - State management for focusedIndex and containerOffset
 */
export function TVContentRow({
  title,
  items,
  focusedCol = -1,
  rowIndex = 0,
  onItemClick,
}: TVContentRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State management for carousel snapping
  const [containerOffset, setContainerOffset] = useState(0);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  
  // Carousel constants
  const POSTER_WIDTH = 160; // 40 (w-40 in Tailwind)
  const GAP = 16; // gap-4 = 16px
  const ITEM_TOTAL_WIDTH = POSTER_WIDTH + GAP; // 176px
  const VISIBLE_ITEMS = 4; // Number of items visible at once
  const SNAP_THRESHOLD = 3; // Snap when reaching 4th item (index 3)
  
  /**
   * Calculate the exact offset needed to keep focused item in view
   * When focusedCol reaches threshold, snap to next window
   */
  useEffect(() => {
    if (focusedCol === -1 || items.length === 0) return;
    
    // Calculate which "window" the focused item belongs to
    const targetWindow = Math.floor(focusedCol / SNAP_THRESHOLD);
    const newOffset = -(targetWindow * SNAP_THRESHOLD * ITEM_TOTAL_WIDTH);
    
    // Only update if offset changed (smooth snap)
    if (newOffset !== containerOffset) {
      setContainerOffset(newOffset);
      setVisibleStartIndex(targetWindow * SNAP_THRESHOLD);
    }
  }, [focusedCol, items.length, containerOffset]);

  return (
    <div className="space-y-4 px-12 py-8">
      {/* Row Title */}
      <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
        {title}
      </h3>

      {/* Carousel Container - Hidden Scrollbar */}
      <div 
        className="relative overflow-hidden pb-4"
        ref={containerRef}
        data-testid={`row-${rowIndex}`}
      >
        {/* Content Row with Smooth Snap Translation */}
        <div
          className="flex gap-4 transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${containerOffset}px)`,
            willChange: 'transform',
          }}
        >
          {items.map((item, colIndex) => (
            <button
              key={`${rowIndex}-${item.id}`}
              onClick={() => onItemClick?.(item)}
              data-focus-id={`row-${rowIndex}-col-${colIndex}`}
              data-testid={`poster-${rowIndex}-${colIndex}`}
              className={cn(
                "relative group flex-shrink-0 w-40 h-56 rounded-lg overflow-hidden transition-all duration-200",
                "focus:outline-none cursor-pointer",
                focusedCol === colIndex && "ring-4 ring-red-500 ring-offset-4 ring-offset-black scale-105 shadow-lg shadow-red-500/50 z-20"
              )}
            >
              {/* Poster Image */}
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${item.posterUrl || 'https://via.placeholder.com/160x240?text=' + encodeURIComponent(item.title)})`,
                }}
              >
                {/* Overlay on Focus */}
                <div className={cn(
                  "absolute inset-0 bg-black/0 transition-all duration-200 flex items-center justify-center",
                  focusedCol === colIndex && "bg-black/60"
                )}>
                  {focusedCol === colIndex && (
                    <div className="text-center px-2">
                      <p className="text-white text-lg font-bold">{item.title}</p>
                      {item.year && <p className="text-gray-300 text-sm">{item.year}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                {item.year && <p className="text-gray-400 text-xs">{item.year}</p>}

                {/* Progress Bar for "Continue Watching" */}
                {item.progress !== undefined && item.progress > 0 && (
                  <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                      data-testid={`progress-${rowIndex}-${item.id}`}
                    />
                  </div>
                )}
              </div>

              {/* Focus Border Animation */}
              {focusedCol === colIndex && (
                <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Navigation Indicators (Optional: Show scroll position) */}
        {items.length > VISIBLE_ITEMS && (
          <div className="absolute bottom-0 right-12 flex gap-1">
            {Array.from({ length: Math.ceil(items.length / SNAP_THRESHOLD) }).map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1 rounded-full transition-all",
                  Math.floor(visibleStartIndex / SNAP_THRESHOLD) === idx
                    ? "w-6 bg-red-500"
                    : "w-2 bg-gray-600"
                )}
                data-testid={`indicator-${rowIndex}-${idx}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
