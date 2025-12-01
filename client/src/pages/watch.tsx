import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TVVideoPlayer } from '@/components/tv/TVVideoPlayer';
import { ArrowLeft } from 'lucide-react';

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

export default function Watch() {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState<ContentItem | null>(null);

  useEffect(() => {
    // Get content from URL params
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    
    if (contentId) {
      const contentData = sessionStorage.getItem(`content_${contentId}`);
      if (contentData) {
        const parsed = JSON.parse(contentData);
        setContent(parsed);
      }
    }
  }, []);

  const handleBack = async () => {
    // Save viewing progress: assume video played for 30 seconds as demo
    if (content) {
      try {
        const token = localStorage.getItem('appToken');
        await fetch('/api/viewing-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            contentId: content.id,
            currentTimeSeconds: 30, // Demo: save 30 seconds progress
            durationSeconds: content.duration || 0,
            contentType: content.type || 'movie',
          }),
        });
      } catch (error) {
        console.error('Failed to save viewing progress:', error);
      }
    }
    setLocation(`/tv/details?id=${content?.id}`);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleBack();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content?.id]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Contenido no encontrado</p>
          <button
            onClick={() => setLocation('/tv')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white"
            data-testid="button-back"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player - Full Screen */}
      <div className="w-full h-screen bg-black">
        <TVVideoPlayer
          videoUrl={content.videoUrl || content.posterUrl}
          title={content.title}
          duration={content.duration || 0}
        />
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 p-2 hover:bg-white/10 rounded transition-colors flex items-center gap-2 text-white"
        aria-label="Go back"
        data-testid="button-back-header"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-sm">Atrás</span>
      </button>

      {/* Keyboard Help - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40 text-white text-xs opacity-60 text-right">
        <div>◀ ▶: Adelante/Atrás</div>
        <div>Espacio: Reproducir/Pausa</div>
        <div>Esc: Salir</div>
      </div>
    </div>
  );
}
