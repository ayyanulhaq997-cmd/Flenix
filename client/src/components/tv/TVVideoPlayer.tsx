import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface TVVideoPlayerProps {
  title: string;
  duration: number;
}

export function TVVideoPlayer({ title, duration }: TVVideoPlayerProps) {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState('Spanish');
  const [selectedSubtitle, setSelectedSubtitle] = useState('Spanish');
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 5 seconds of inactivity
  const scheduleControlsHide = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 5000);
  };

  // Simulate video playback
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    }
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, [isPlaying, duration]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      scheduleControlsHide();

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (showControls && !showAudioMenu) {
            setCurrentTime(Math.min(duration, currentTime + 10));
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (showControls && !showAudioMenu) {
            setCurrentTime(Math.max(0, currentTime - 10));
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (showControls) {
            setShowAudioMenu(true);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (showAudioMenu) {
            setShowAudioMenu(false);
          }
          break;

        case 'Escape':
          e.preventDefault();
          // Save viewing progress to backend (mock)
          console.log(`Saved progress: ${currentTime}s / ${duration}s`);
          setLocation('/tv/details');
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, showControls, showAudioMenu, setLocation]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden" data-testid="video-player">
      {/* Video Container */}
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-gray-400">▶ {isPlaying ? 'Playing' : 'Paused'}</p>
        </div>
      </div>

      {/* Playback Controls - Show on any key press, hide after 5s */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 space-y-4" data-testid="playback-controls">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-600 h-2 rounded cursor-pointer" data-testid="progress-bar">
              <div
                className="bg-red-600 h-full rounded transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
              <span data-testid="time-current">{formatTime(currentTime)}</span>
              <span data-testid="time-duration">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons Row */}
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => {
                setCurrentTime(Math.max(0, currentTime - 10));
                scheduleControlsHide();
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold flex items-center gap-2 transition-all"
              data-testid="button-rewind"
            >
              ⏪ -10s
            </button>

            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                scheduleControlsHide();
              }}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded font-bold text-lg transition-all"
              data-testid="button-play-pause"
            >
              {isPlaying ? '⏸ Pausar' : '▶ Reproducir'}
            </button>

            <button
              onClick={() => {
                setCurrentTime(Math.min(duration, currentTime + 10));
                scheduleControlsHide();
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold flex items-center gap-2 transition-all"
              data-testid="button-skip"
            >
              +10s ⏩
            </button>

            <button
              onClick={() => {
                setShowAudioMenu(!showAudioMenu);
                scheduleControlsHide();
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
              data-testid="button-audio"
            >
              🔊 Audio/Subs
            </button>

            <button
              onClick={() => {
                console.log(`Saved progress: ${currentTime}s / ${duration}s`);
                setLocation('/tv/details');
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
              data-testid="button-exit"
            >
              ✕ Salir
            </button>
          </div>

          {/* Keyboard Hints */}
          <div className="text-xs text-gray-500 text-center">
            <p>▶ Espacio: Play/Pause | ◀ ▶: ±10s | ▼: Audio/Subs | Esc: Salir</p>
          </div>
        </div>
      )}

      {/* Audio/Subtitle Menu Overlay */}
      {showAudioMenu && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50" data-testid="audio-subtitle-menu">
          <div className="bg-gray-900 p-8 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Audio y Subtítulos</h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Audio Languages */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Idiomas de Audio</h3>
                <div className="space-y-3">
                  {['Spanish', 'English', 'Portuguese'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedAudio(lang);
                        scheduleControlsHide();
                      }}
                      className={`w-full p-3 rounded text-left transition-all ${
                        selectedAudio === lang
                          ? 'bg-red-600 text-white font-semibold border-2 border-red-400'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                      data-testid={`audio-${lang.toLowerCase()}`}
                    >
                      {selectedAudio === lang && '✓ '} {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitles */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Subtítulos</h3>
                <div className="space-y-3">
                  {['Off', 'Spanish', 'English', 'Portuguese'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSubtitle(sub);
                        scheduleControlsHide();
                      }}
                      className={`w-full p-3 rounded text-left transition-all ${
                        selectedSubtitle === sub
                          ? 'bg-red-600 text-white font-semibold border-2 border-red-400'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                      data-testid={`subtitle-${sub.toLowerCase()}`}
                    >
                      {selectedSubtitle === sub && '✓ '} {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowAudioMenu(false);
                scheduleControlsHide();
              }}
              className="w-full mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
              data-testid="button-close-menu"
            >
              ← Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
