import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { TVHeader } from '@/components/tv/TVHeader';
import { Spinner } from '@/components/ui/spinner';
import { isAuthenticated } from '@/lib/auth-utils';
import axios from 'axios';

interface Profile {
  id: number;
  name: string;
  avatarUrl?: string;
}

export default function TVProfiles() {
  const [location, setLocation] = useLocation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  // Check authentication - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation('/login');
    }
  }, [setLocation, location]);

  // Fetch profiles with React Query
  const { data: fetchedProfiles = [], isLoading: isProfilesLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return [];
      const { data } = await axios.get('/api/user-profiles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
    enabled: isAuthenticated(),
    retry: 1,
  });

  // Update local profiles when fetched data arrives
  useEffect(() => {
    if (fetchedProfiles.length > 0) {
      setProfiles(fetchedProfiles);
    }
  }, [fetchedProfiles]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddProfile) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowAddProfile(false);
          setNewProfileName('');
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(Math.max(0, focusedIndex - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(Math.min(profiles.length, focusedIndex + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex === profiles.length) {
            // Add profile button
            setShowAddProfile(true);
          } else {
            // Select profile
            console.log('Selected profile:', profiles[focusedIndex]);
            setLocation('/tv');
          }
          break;
        case 'Escape':
          e.preventDefault();
          console.log('Exit app');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, profiles, showAddProfile, setLocation]);

  const handleAddProfile = () => {
    if (newProfileName.trim()) {
      const newProfile: Profile = {
        id: Math.max(...profiles.map(p => p.id), 0) + 1,
        name: newProfileName,
      };
      setProfiles([...profiles, newProfile]);
      setNewProfileName('');
      setShowAddProfile(false);
    }
  };

  // Show loading spinner while profiles are loading
  if (isProfilesLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Spinner className="size-12 mx-auto mb-4" />
          <p className="text-xl text-gray-300">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (should be caught by useEffect, but double-check)
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <TVHeader isFocused={false} />

      <main className="pt-32 px-20">
        <h1 className="text-5xl font-bold mb-16" data-testid="text-select-profile">
          Selecciona tu Perfil
        </h1>

        {/* Profile Grid */}
        <div className="flex gap-12 flex-wrap" data-testid="profiles-grid">
          {profiles.map((profile, idx) => (
            <button
              key={profile.id}
              onClick={() => setLocation('/tv')}
              className={`text-center transition-all ${
                focusedIndex === idx ? 'scale-110' : ''
              }`}
              data-testid={`profile-${profile.id}`}
            >
              <div
                className={`w-40 h-40 rounded-lg mb-4 flex items-center justify-center text-5xl transition-all ${
                  focusedIndex === idx
                    ? 'bg-gradient-to-br from-red-600 to-red-800 border-4 border-red-400 shadow-lg shadow-red-600'
                    : 'bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600'
                }`}
              >
                👤
              </div>
              <p className={`text-xl font-semibold ${focusedIndex === idx ? 'text-red-400' : 'text-gray-300'}`}>
                {profile.name}
              </p>
            </button>
          ))}

          {/* Add Profile Button */}
          <button
            onClick={() => setShowAddProfile(true)}
            className={`text-center transition-all ${focusedIndex === profiles.length ? 'scale-110' : ''}`}
            data-testid="button-add-profile"
          >
            <div
              className={`w-40 h-40 rounded-lg mb-4 flex items-center justify-center text-5xl transition-all ${
                focusedIndex === profiles.length
                  ? 'bg-gradient-to-br from-green-600 to-green-800 border-4 border-green-400 shadow-lg shadow-green-600'
                  : 'bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600'
              }`}
            >
              +
            </div>
            <p className={`text-xl font-semibold ${focusedIndex === profiles.length ? 'text-green-400' : 'text-gray-300'}`}>
              Añadir Perfil
            </p>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-20 text-gray-400 text-sm">
          <p>◀ ▶: Navegar entre perfiles | Intro: Seleccionar | Esc: Salir</p>
        </div>
      </main>

      {/* Add Profile Modal */}
      {showAddProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Nuevo Perfil</h2>
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Nombre del perfil"
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white mb-6 focus:border-red-500 focus:outline-none"
              autoFocus
              data-testid="input-profile-name"
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowAddProfile(false);
                  setNewProfileName('');
                }}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
                data-testid="button-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProfile}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded font-semibold transition-all"
                data-testid="button-create"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
