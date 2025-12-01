import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { TVHeader } from '@/components/tv/TVHeader';
import { Spinner } from '@/components/ui/spinner';
import { isAuthenticated, logout } from '@/lib/auth-utils';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Check authentication - show login option if not authenticated
  const isLoggedIn = isAuthenticated();

  // Fetch profiles with React Query
  const { data: fetchedProfiles = [], isLoading: isProfilesLoading } = useQuery({
    queryKey: ['user-profiles'],
    queryFn: async () => {
      const token = localStorage.getItem('appToken');
      if (!token) return [];
      const { data } = await axios.get('/api/profiles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
    enabled: isLoggedIn,
    retry: 1,
  });

  // Update local profiles when fetched data arrives
  useEffect(() => {
    if (fetchedProfiles.length > 0) {
      setProfiles(fetchedProfiles);
    }
  }, [fetchedProfiles]);

  const handleSelectProfile = async (profileId: number) => {
    try {
      const token = localStorage.getItem('appToken');
      if (!token) {
        setLocation('/login');
        return;
      }

      const response = await axios.post('/api/auth/select-profile', 
        { profileId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.status === 200) {
        // Store active profile in localStorage
        localStorage.setItem('activeProfileId', String(profileId));
        // Navigate to home page with personalized content
        setLocation('/tv');
      }
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLogoutConfirm) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          setShowLogoutConfirm(false);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogout();
        }
        return;
      }

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
          setFocusedIndex(Math.min(profiles.length + 1, focusedIndex + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex === profiles.length) {
            // Add profile button
            setShowAddProfile(true);
          } else if (focusedIndex === profiles.length + 1) {
            // Logout button
            setShowLogoutConfirm(true);
          } else {
            // Select profile and navigate to home
            handleSelectProfile(profiles[focusedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          // Go back to home
          setLocation('/tv');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, profiles, showAddProfile, showLogoutConfirm, setLocation]);

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;
    
    try {
      const token = localStorage.getItem('appToken');
      if (!token) {
        setLocation('/login');
        return;
      }

      const response = await axios.post('/api/profiles', 
        { name: newProfileName.trim(), isKidsProfile: false },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.status === 201) {
        // Store new profile and navigate to home
        localStorage.setItem('activeProfileId', String(response.data.id));
        setNewProfileName('');
        setShowAddProfile(false);
        // Navigate to home after creating profile
        setLocation('/tv');
      }
    } catch (error: any) {
      console.error('Error creating profile:', error.response?.data?.error || error.message);
    }
  };

  // Show loading spinner while profiles are loading
  if (isProfilesLoading && isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Spinner className="size-12 mx-auto mb-4" />
          <p className="text-xl text-gray-300">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  // Show sign-in/sign-up option if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white">
        <TVHeader isFocused={false} />
        
        <main className="pt-32 px-20 flex flex-col items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-8">
            <h1 className="text-5xl font-bold mb-4" data-testid="text-welcome">
              Bienvenido a Fenix
            </h1>
            <p className="text-2xl text-gray-400 mb-12">Inicia sesión para acceder a tus perfiles</p>
            
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setLocation('/login')}
                className="px-12 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-xl transition-all shadow-lg"
                data-testid="button-signin"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setLocation('/signup')}
                className="px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-xl transition-all shadow-lg"
                data-testid="button-signup"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <TVHeader isFocused={false} />

      <main className="pt-32 px-20">
        {/* Back Button */}
        <button
          onClick={() => setLocation('/tv')}
          className="flex items-center gap-2 mb-12 px-4 py-2 text-gray-300 hover:text-red-400 transition-colors focus:outline-none"
          data-testid="button-back-profiles"
          aria-label="Volver atrás"
        >
          <span className="text-2xl">←</span>
          <span className="text-lg font-semibold">Atrás</span>
        </button>

        <h1 className="text-5xl font-bold mb-16" data-testid="text-select-profile">
          Selecciona tu Perfil
        </h1>

        {/* Profile Grid */}
        <div className="flex gap-12 flex-wrap" data-testid="profiles-grid">
          {profiles.map((profile, idx) => (
            <button
              key={profile.id}
              onClick={() => handleSelectProfile(profile.id)}
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

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className={`mt-20 px-8 py-3 rounded-lg font-semibold transition-all ${
            focusedIndex === profiles.length + 1
              ? 'bg-orange-600 hover:bg-orange-700 border-4 border-orange-400 shadow-lg shadow-orange-600 scale-105'
              : 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600'
          }`}
          data-testid="button-logout"
          aria-label="Cerrar sesión"
        >
          Cerrar Sesión
        </button>

        {/* Instructions */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>◀ ▶: Navegar | Intro: Seleccionar | Esc: Salir</p>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full mx-4 border-2 border-orange-600">
            <h2 className="text-2xl font-bold mb-4 text-orange-400">Confirmar Cierre de Sesión</h2>
            <p className="text-gray-300 mb-8">¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition-all"
                data-testid="button-cancel-logout"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded font-semibold transition-all"
                data-testid="button-confirm-logout"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

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
