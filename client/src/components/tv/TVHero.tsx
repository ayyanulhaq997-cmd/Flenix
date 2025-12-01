import { Play, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TVHeroProps {
  title?: string;
  genres?: string[];
  summary?: string;
  backgroundImage?: string;
  isFocused?: boolean;
  onPlay?: () => void;
  onMoreInfo?: () => void;
}

export function TVHero({
  title = "Avengers Doomsday",
  genres = ["Acción", "Aventura", "Ciencia Ficción"],
  summary = "Un equipo de superhéroes se reúne para salvar el mundo de una amenaza intergaláctica.",
  backgroundImage = "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&h=1080&fit=crop",
  isFocused = false,
  onPlay,
  onMoreInfo,
}: TVHeroProps) {
  return (
    <div className="relative w-full h-[500px] mt-24 overflow-hidden group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-12 pb-12 space-y-6">
        {/* Title */}
        <div>
          <h2 className={cn(
            "text-5xl font-bold text-white mb-4 transition-all duration-200",
            isFocused && "text-6xl text-red-400 drop-shadow-lg"
          )}>
            {title}
          </h2>

          {/* Genres */}
          <div className="flex gap-3 flex-wrap">
            {genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-red-600/50 text-white text-sm rounded-full border border-red-500/50"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Summary */}
        <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
          {summary}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onPlay}
            className={cn(
              "flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-semibold transition-all duration-200",
              "hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black",
              isFocused && "bg-red-500 shadow-lg shadow-red-500/50"
            )}
            data-testid="button-play-hero"
          >
            <Play size={20} />
            <span>REPRODUCIR</span>
          </button>

          <button
            onClick={onMoreInfo}
            className={cn(
              "flex items-center gap-2 px-8 py-3 bg-white/20 text-white rounded-lg font-semibold transition-all duration-200",
              "hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black",
              isFocused && "bg-white/40 shadow-lg shadow-white/30"
            )}
            data-testid="button-info-hero"
          >
            <Info size={20} />
            <span>MÁS INFORMACIÓN</span>
          </button>
        </div>
      </div>

      {/* Focus Border */}
      {isFocused && (
        <div className="absolute inset-0 border-4 border-red-500 rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
}
