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

export function TVContentRow({
  title,
  items,
  focusedCol = -1,
  rowIndex = 0,
  onItemClick,
}: TVContentRowProps) {
  return (
    <div className="space-y-4 px-12 py-8">
      {/* Row Title */}
      <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
        {title}
      </h3>

      {/* Scrollable Content */}
      <div className="overflow-x-auto pb-4 scroll-smooth">
        <div className="flex gap-4 min-w-min">
          {items.map((item, colIndex) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              data-focus-id={`row-${rowIndex}-col-${colIndex}`}
              className={cn(
                "relative group flex-shrink-0 w-40 h-56 rounded-lg overflow-hidden transition-all duration-200",
                "focus:outline-none",
                focusedCol === colIndex && "ring-4 ring-red-500 ring-offset-4 ring-offset-black scale-105 shadow-lg shadow-red-500/50"
              )}
            >
              {/* Poster Image */}
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.posterUrl || 'https://via.placeholder.com/160x240?text=' + item.title})` }}
              >
                {/* Overlay on Hover/Focus */}
                <div className={cn(
                  "absolute inset-0 bg-black/0 transition-all duration-200 flex items-center justify-center",
                  focusedCol === colIndex && "bg-black/60"
                )}>
                  {focusedCol === colIndex && (
                    <div className="text-center">
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

                {/* Progress Bar */}
                {item.progress !== undefined && (
                  <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
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
      </div>
    </div>
  );
}
