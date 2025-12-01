import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { TVVideoPlayer } from '@/components/tv/TVVideoPlayer';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Get content from URL params or sessionStorage
    const params = new URLSearchParams(window.location.search);
    const contentId = params.get('id');
    const titleParam = params.get('title');
    
    if (contentId) {
      // First try to get from sessionStorage
      const contentData = sessionStorage.getItem(`content_${contentId}`);
      if (contentData) {
        const parsed = JSON.parse(contentData);
        setContent(parsed);
      } else if (titleParam) {
        // If sessionStorage miss, create content from params
        const content: ContentItem = {
          id: contentId,
          title: titleParam,
          type: (params.get('type') as 'movie' | 'series') || 'movie',
          posterUrl: params.get('poster') || undefined,
          description: params.get('description') || undefined,
          genre: params.get('genre') || undefined,
          duration: params.get('duration') ? parseInt(params.get('duration')!) : undefined,
          rating: params.get('rating') || undefined,
          requiredPlan: params.get('plan') || 'free',
        };
        setContent(content);
      }
    }
  }, []);

  const handleBack = async () => {
    // Save viewing progress with profileId
    if (content) {
      try {
        const token = localStorage.getItem('appToken');
        const activeProfileId = localStorage.getItem('activeProfileId');
        const userId = localStorage.getItem('userId');

        // Only save if we have required data
        if (token && userId) {
          const response = await fetch('/api/viewing-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              contentId: content.id,
              currentTimeSeconds: Math.round(currentTime) || 30,
              durationSeconds: content.duration || 0,
              contentType: content.type || 'movie',
              profileId: activeProfileId ? parseInt(activeProfileId) : null,
            }),
          });

          if (!response.ok) {
            console.warn('Failed to save viewing progress - continuing anyway');
          }
        }
      } catch (error) {
        console.error('Error saving viewing progress:', error);
        // Continue navigation even if save fails
      }
    }
    
    // Verify localStorage data is intact before navigating
    const token = localStorage.getItem('appToken');
    if (!token) {
      console.warn('Token missing - redirecting to login');
      setLocation('/login');
      return;
    }

    // Navigate back to details page
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
  }, [content?.id, currentTime]);

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
    <div className="min-h-screen bg-black" data-testid="watch-page">
      {/* Video Player - Full Screen */}
      <div className="w-full h-screen bg-black">
        <TVVideoPlayer
          videoUrl={content.videoUrl || content.posterUrl}
          title={content.title}
          duration={content.duration || 0}
          onCurrentTimeChange={setCurrentTime}
          onExit={handleBack}
        />
      </div>

      {/* Back Button - Always Visible */}
      <button
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 p-2 hover:bg-white/10 rounded transition-colors flex items-center gap-2 text-white"
        aria-label="Go back"
        data-testid="button-back-watch"
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
