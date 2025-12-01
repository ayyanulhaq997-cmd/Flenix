import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { TVHeader } from '@/components/tv/TVHeader';
import { TVVideoPlayer } from '@/components/tv/TVVideoPlayer';

interface Episode {
  id: number;
  season: number;
  episode: number;
  title: string;
  description: string;
  duration: number;
}

interface ContentItem {
  id: string | number;
  title: string;
  year?: number;
  type?: 'movie' | 'series';
  posterUrl?: string;
  description?: string;
  genre?: string;
  duration?: number;
  rating?: string;
  cast?: string[];
  requiredPlan?: string;
}

// Mock episodes data
const mockEpisodes: Record<number, Episode[]> = {
  101: [ // Loki series
    { id: 1, season: 1, episode: 1, title: "Glorious Purpose", description: "Loki escapes and encounters the TVA", duration: 2700 },
    { id: 2, season: 1, episode: 2, title: "The Variant", description: "Loki and Mobius hunt a variant", duration: 2400 },
    { id: 3, season: 1, episode: 3, title: "Lamentis", description: "Loki and the variant are stranded", duration: 2100 },
    { id: 4, season: 1, episode: 4, title: "The Nexus Event", description: "Consequences of the timeline", duration: 2500 },
    { id: 5, season: 1, episode: 5, title: "Journey Into Mystery", description: "New discoveries await", duration: 2800 },
    { id: 6, season: 1, episode: 6, title: "For All Time. Always.", description: "The season finale", duration: 3000 },
  ],
  102: [ // WandaVision
    { id: 1, season: 1, episode: 1, title: "Filmed Before a Live Studio Audience", description: "The classic sitcom begins", duration: 2100 },
    { id: 2, season: 1, episode: 2, title: "Don't Touch That Dial", description: "Something's not quite right", duration: 2200 },
  ],
};

export default function TVDetails() {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInMyList, setIsInMyList] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [focusedButton, setFocusedButton] = useState<'play' | 'mylist' | 'trailer' | 'back'>('play');
  const [focusedElement, setFocusedElement] = useState<'buttons' | 'episodes'>('buttons');
  const [focusedEpisodeIndex, setFocusedEpisodeIndex] = useState(0);
  const episodeScrollRef = useRef<HTMLDivElement>(null);

  const isSeries = content?.id && typeof content.id === 'number' && content.id > 100 && content.id < 200;
  const episodes = isSeries && content?.id ? (mockEpisodes[content.id as number] || []) : [];
  const uniqueSeasons = Array.from(new Set(episodes.map(e => e.season))).sort((a, b) => a - b);
  const seasonEpisodes = episodes.filter(e => e.season === selectedSeason);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    const autoplay = params.get('autoplay') === 'true';
    const contentData = sessionStorage.getItem(`content_${contentId}`);
    
    if (contentData) {
      const parsed = JSON.parse(contentData);
      const contentWithType = {
        ...parsed,
        type: parseInt(contentId as string) > 100 ? 'series' : 'movie',
      };
      setContent(contentWithType);
      if (seasonEpisodes.length > 0) {
        setSelectedEpisode(seasonEpisodes[0]);
      }
      // Auto-play if requested
      if (autoplay) {
        setIsPlaying(true);
      }
    }
  }, []);

  useEffect(() => {
    if (focusedElement === 'episodes' && seasonEpisodes.length > 0) {
      setSelectedEpisode(seasonEpisodes[focusedEpisodeIndex]);
    }
  }, [focusedEpisodeIndex, focusedElement, selectedSeason]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTrailer) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          setShowTrailer(false);
        }
        return;
      }

      if (focusedElement === 'episodes') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            setFocusedElement('buttons');
            break;
          case 'ArrowDown':
            e.preventDefault();
            setFocusedEpisodeIndex(Math.min(seasonEpisodes.length - 1, focusedEpisodeIndex + 1));
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setFocusedEpisodeIndex(Math.max(0, focusedEpisodeIndex - 1));
            break;
          case 'ArrowRight':
            e.preventDefault();
            setFocusedEpisodeIndex(Math.min(seasonEpisodes.length - 1, focusedEpisodeIndex + 1));
            break;
          case 'Enter':
            e.preventDefault();
            setIsPlaying(true);
            break;
          case 'Escape':
            e.preventDefault();
            setLocation('/tv');
            break;
          default:
            break;
        }
      } else {
        // Button navigation
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (focusedButton === 'mylist') setFocusedButton('play');
            else if (focusedButton === 'trailer') setFocusedButton('mylist');
            else if (focusedButton === 'back') setFocusedButton('trailer');
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (focusedButton === 'play') setFocusedButton('mylist');
            else if (focusedButton === 'mylist') setFocusedButton('trailer');
            else if (focusedButton === 'trailer') setFocusedButton('back');
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedButton('back');
            break;
          case 'ArrowDown':
            e.preventDefault();
            if (isSeries && seasonEpisodes.length > 0) {
              setFocusedElement('episodes');
              setFocusedEpisodeIndex(0);
            }
            break;
          case 'Enter':
            e.preventDefault();
            if (focusedButton === 'play') {
              setIsPlaying(true);
            } else if (focusedButton === 'mylist') {
              setIsInMyList(!isInMyList);
            } else if (focusedButton === 'trailer') {
              setShowTrailer(true);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setLocation('/tv');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedButton, focusedElement, focusedEpisodeIndex, seasonEpisodes, isSeries, isInMyList, setLocation, showTrailer]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (isPlaying) {
    const playTitle = selectedEpisode 
      ? `${content.title} - S${selectedEpisode.season}E${selectedEpisode.episode}: ${selectedEpisode.title}`
      : content.title;
    const playDuration = selectedEpisode ? selectedEpisode.duration : (content.duration || 7200);
    return <TVVideoPlayer title={playTitle} duration={playDuration} />;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      <TVHeader isFocused={false} />

      {/* Persistent Back Button */}
      <div className="fixed top-24 left-8 z-40">
        <button
          onClick={() => setLocation('/tv')}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all shadow-lg"
          data-testid="button-back-details"
          aria-label="Volver al inicio"
        >
          <span className="text-2xl">←</span>
          <span>ATRÁS</span>
        </button>
      </div>

      <main className="pt-20">
        <div className="px-20 py-12">
          <div className="grid grid-cols-3 gap-12">
            {/* Poster */}
            <div className="flex justify-center">
              <div
                className="w-64 h-96 bg-gradient-to-br from-red-900 to-black rounded-lg border-4 border-gray-700 flex items-center justify-center"
                data-testid="poster-details"
              >
                <div className="text-center">
                  <p className="text-4xl mb-2">🎬</p>
                  <p className="text-sm text-gray-400">{content.title}</p>
                </div>
              </div>
            </div>

            {/* Content Info */}
            <div className="col-span-2 space-y-6">
              <div>
                <h1 className="text-5xl font-bold mb-4" data-testid="text-title">
                  {content.title}
                </h1>
                <div className="flex gap-4 mb-4">
                  <span className="text-lg text-red-500 font-semibold">{content.year}</span>
                  {content.genre && (
                    <span className="text-lg text-gray-400" data-testid="text-genre">
                      {content.genre}
                    </span>
                  )}
                  {content.duration && !isSeries && (
                    <span className="text-lg text-gray-400">
                      {Math.floor(content.duration / 60)}h {content.duration % 60}m
                    </span>
                  )}
                  {isSeries && (
                    <span className="text-lg text-gray-400" data-testid="text-seasons">
                      {uniqueSeasons.length} temporadas
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Sinopsis</h2>
                <p className="text-gray-300 leading-relaxed" data-testid="text-description">
                  {selectedEpisode 
                    ? selectedEpisode.description
                    : (content.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
                  }
                </p>
              </div>

              {/* Metadata: Rating, Cast */}
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-gray-700">
                {content.rating && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2">Clasificación</h3>
                    <p className="text-lg font-semibold" data-testid="text-rating">{content.rating}</p>
                  </div>
                )}
                {content.requiredPlan && (
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2">Plan Requerido</h3>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-sm" data-testid="text-plan">
                      {content.requiredPlan === 'free' ? 'Gratis' : content.requiredPlan}
                    </span>
                  </div>
                )}
              </div>

              {/* Cast and Crew */}
              {content.cast && content.cast.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Elenco</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.cast.map((actor, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-sm" data-testid={`cast-${idx}`}>
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setIsPlaying(true)}
                  className={`px-10 py-3 font-bold text-lg rounded-lg transition-all ${
                    focusedButton === 'play'
                      ? 'bg-red-600 border-4 border-red-400 text-white scale-105'
                      : 'bg-red-700 border-2 border-red-600 text-white hover:bg-red-600'
                  }`}
                  data-testid="button-play"
                >
                  ▶ REPRODUCIR
                </button>

                <button
                  onClick={() => setIsInMyList(!isInMyList)}
                  className={`px-10 py-3 font-bold text-lg rounded-lg transition-all ${
                    focusedButton === 'mylist'
                      ? 'border-4 border-red-400 scale-105'
                      : 'border-2'
                  } ${
                    isInMyList
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                  data-testid="button-mylist"
                >
                  {isInMyList ? '✓ EN MI LISTA' : '+ MI LISTA'}
                </button>

                <button
                  onClick={() => setShowTrailer(true)}
                  className={`px-10 py-3 font-bold text-lg rounded-lg transition-all ${
                    focusedButton === 'trailer'
                      ? 'bg-gray-700 border-4 border-gray-500 text-white scale-105'
                      : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                  data-testid="button-trailer"
                >
                  ▶ TRAILER
                </button>

                <button
                  onClick={() => setLocation('/tv')}
                  className={`px-8 py-3 font-semibold rounded transition-all ${
                    focusedButton === 'back'
                      ? 'bg-gray-600 border-4 border-gray-400 text-white scale-105'
                      : 'bg-gray-800 border-2 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                  data-testid="button-back"
                >
                  ← ATRÁS
                </button>
              </div>
            </div>
          </div>

          {/* Related Content - "More like this" */}
          <div className="mt-16 pt-12 border-t border-gray-700">
            <h2 className="text-3xl font-bold mb-6" data-testid="text-related-title">
              Contenido Similar
            </h2>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-gray-800 to-black rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  data-testid={`related-content-${idx}`}
                >
                  <div className="w-full h-40 bg-cover bg-center flex items-center justify-center border-2 border-gray-700">
                    <p className="text-3xl">🎬</p>
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm truncate">{content.title} {idx + 1}</p>
                    <p className="text-gray-400 text-xs">{content.genre || 'Entretenimiento'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Season & Episodes Section for Series */}
          {isSeries && seasonEpisodes.length > 0 && (
            <div className="mt-16 pt-12 border-t border-gray-700">
              <h2 className="text-3xl font-bold mb-6" data-testid="text-episodes-title">
                Episodios
              </h2>

              {/* Season Selector */}
              <div className="mb-8 flex gap-3">
                {uniqueSeasons.map(season => (
                  <button
                    key={season}
                    onClick={() => {
                      setSelectedSeason(season);
                      setFocusedEpisodeIndex(0);
                    }}
                    className={`px-6 py-2 rounded font-semibold transition-all ${
                      selectedSeason === season
                        ? 'bg-red-600 border-2 border-red-400 text-white'
                        : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }`}
                    data-testid={`button-season-${season}`}
                  >
                    Temporada {season}
                  </button>
                ))}
              </div>

              {/* Episodes Grid */}
              <div
                className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto pr-4"
                ref={episodeScrollRef}
                data-testid="episodes-list"
              >
                {seasonEpisodes.map((ep, idx) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      setFocusedEpisodeIndex(idx);
                      setFocusedElement('episodes');
                    }}
                    className={`p-4 rounded-lg transition-all cursor-pointer ${
                      focusedElement === 'episodes' && focusedEpisodeIndex === idx
                        ? 'bg-red-600 border-4 border-red-400 scale-105'
                        : 'bg-gray-800 border-2 border-gray-700 hover:bg-gray-700'
                    }`}
                    data-testid={`episode-${ep.season}-${ep.episode}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-red-500">
                        {ep.episode}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{ep.title}</h3>
                        <p className="text-gray-400 text-sm">{ep.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {Math.floor(ep.duration / 60)}m {ep.duration % 60}s
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4" data-testid="trailer-title">Tráiler: {content.title}</h2>
            <div className="w-full h-64 bg-black rounded-lg mb-4 flex items-center justify-center border-2 border-red-600">
              <p className="text-gray-400 text-lg">▶ Reproductor de Tráiler (Mock)</p>
            </div>
            <button
              onClick={() => setShowTrailer(false)}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
              data-testid="button-close-trailer"
            >
              Cerrar (Presiona Enter o Escape)
            </button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-black/80 border border-red-500 p-3 rounded text-xs text-gray-400">
        <p>Focus: {focusedElement === 'buttons' ? focusedButton : `episode-${focusedEpisodeIndex}`}</p>
        <p className="text-xs text-gray-500 mt-2">Use Arrow Keys + Enter to navigate</p>
      </div>
    </div>
  );
}
