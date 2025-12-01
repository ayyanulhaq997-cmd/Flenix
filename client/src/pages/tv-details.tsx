import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TVHeader } from '@/components/tv/TVHeader';

interface ContentItem {
  id: string | number;
  title: string;
  year: number;
  posterUrl?: string;
  description?: string;
  genre?: string;
  duration?: number;
}

export default function TVDetails() {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [focusedButton, setFocusedButton] = useState<'play' | 'info' | 'back'>('play');

  useEffect(() => {
    // Get content from URL params or session storage
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    const contentData = sessionStorage.getItem(`content_${contentId}`);
    
    if (contentData) {
      setContent(JSON.parse(contentData));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (focusedButton === 'info') setFocusedButton('play');
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (focusedButton === 'play') setFocusedButton('info');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedButton('back');
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedButton === 'back') setFocusedButton('play');
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedButton === 'play') {
            setIsPlaying(true);
            console.log('Starting playback for:', content?.title);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setLocation('/tv');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedButton, content, setLocation]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Now Playing</h1>
          <p className="text-xl mb-8">{content.title}</p>
          <div className="w-full h-64 bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400">🎬 Video Player</p>
              <p className="text-sm text-gray-500 mt-2">(Mock - In production, use HLS/DASH player)</p>
            </div>
          </div>
          <p className="text-sm text-gray-400">Press Escape to stop playback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <TVHeader isFocused={false} />

      <main className="pt-20">
        {/* Details Container */}
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
                  {content.duration && (
                    <span className="text-lg text-gray-400">
                      {Math.floor(content.duration / 60)}h {content.duration % 60}m
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-3">Sinopsis</h2>
                <p className="text-gray-300 leading-relaxed" data-testid="text-description">
                  {content.description ||
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-6 pt-6">
                <button
                  onClick={() => {
                    setIsPlaying(true);
                  }}
                  className={`px-12 py-4 font-bold text-lg rounded-lg transition-all ${
                    focusedButton === 'play'
                      ? 'bg-red-600 border-4 border-red-400 text-white scale-105'
                      : 'bg-red-700 border-2 border-red-600 text-white hover:bg-red-600'
                  }`}
                  data-testid="button-play"
                >
                  ▶ REPRODUCIR
                </button>

                <button
                  className={`px-12 py-4 font-bold text-lg rounded-lg transition-all ${
                    focusedButton === 'info'
                      ? 'bg-gray-700 border-4 border-gray-500 text-white scale-105'
                      : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                  data-testid="button-info"
                >
                  ℹ MÁS INFORMACIÓN
                </button>
              </div>

              {/* Back Button */}
              <button
                onClick={() => setLocation('/tv')}
                className={`mt-6 px-8 py-2 font-semibold rounded transition-all ${
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
      </main>

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-black/80 border border-red-500 p-3 rounded text-xs text-gray-400">
        <p>Focus: {focusedButton}</p>
        <p className="text-xs text-gray-500 mt-2">Use Arrow Keys + Enter to navigate</p>
      </div>
    </div>
  );
}
