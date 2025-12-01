import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Plus, Trash2 } from 'lucide-react';

interface ParentalProfile {
  id: number;
  profileName: string;
  pinProtected: boolean;
  maxRating: string;
  allowedGenres: string[];
}

const RATINGS = ['G', 'PG', 'PG-13', 'R', '18+'];
const GENRES = ['Acción', 'Comedia', 'Drama', 'Terror', 'Adulto', 'Documentales'];

export default function AdminParentalControls() {
  const [profiles, setProfiles] = useState<ParentalProfile[]>([
    { id: 1, profileName: 'Niño', pinProtected: true, maxRating: 'G', allowedGenres: ['Comedia', 'Documentales'] },
    { id: 2, profileName: 'Adolescente', pinProtected: false, maxRating: 'PG-13', allowedGenres: ['Comedia', 'Drama', 'Acción'] },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [pin, setPin] = useState('');

  const handleTogglePIN = (id: number) => {
    setProfiles(profiles.map(p => 
      p.id === id ? { ...p, pinProtected: !p.pinProtected } : p
    ));
  };

  const handleRatingChange = (id: number, rating: string) => {
    setProfiles(profiles.map(p =>
      p.id === id ? { ...p, maxRating: rating } : p
    ));
  };

  const handleGenreToggle = (id: number, genre: string) => {
    setProfiles(profiles.map(p => 
      p.id === id 
        ? {
            ...p,
            allowedGenres: p.allowedGenres.includes(genre)
              ? p.allowedGenres.filter(g => g !== genre)
              : [...p.allowedGenres, genre]
          }
        : p
    ));
  };

  const handleDeleteProfile = (id: number) => {
    if (window.confirm('¿Eliminar este perfil?')) {
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Controles Parentales</h1>
            <p className="text-gray-400">Gestiona el acceso a contenido por perfil con protección PIN</p>
          </div>
          <Button className="gap-2 bg-red-600 hover:bg-red-700" onClick={() => setShowNewProfile(true)}>
            <Plus size={18} />
            Nuevo Perfil
          </Button>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-slate-800 rounded-lg p-6 space-y-6" data-testid={`profile-${profile.id}`}>
              {/* Profile Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-white">{profile.profileName}</h3>
                  <p className="text-gray-400 text-sm mt-1">Modo infantil configurado</p>
                </div>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="p-2 hover:bg-slate-700 rounded transition"
                  data-testid={`delete-profile-${profile.id}`}
                >
                  <Trash2 size={20} className="text-red-400" />
                </button>
              </div>

              {/* PIN Protection */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.pinProtected}
                    onChange={() => handleTogglePIN(profile.id)}
                    className="w-5 h-5 rounded cursor-pointer"
                    data-testid={`pin-toggle-${profile.id}`}
                  />
                  <span className="text-white font-semibold flex items-center gap-2">
                    {profile.pinProtected ? (
                      <>
                        <Lock size={18} className="text-green-500" />
                        Protección PIN Activada
                      </>
                    ) : (
                      <>
                        <Unlock size={18} className="text-gray-400" />
                        Protección PIN Desactivada
                      </>
                    )}
                  </span>
                </label>
                {profile.pinProtected && (
                  <div className="mt-3 p-3 bg-slate-700 rounded">
                    <p className="text-gray-300 text-sm mb-2">PIN: ****</p>
                    <Button className="w-full bg-slate-600 hover:bg-slate-500 text-sm" size="sm">
                      Cambiar PIN
                    </Button>
                  </div>
                )}
              </div>

              {/* Rating Limit */}
              <div>
                <label className="block text-white font-semibold mb-3">Calificación Máxima</label>
                <select
                  value={profile.maxRating}
                  onChange={(e) => handleRatingChange(profile.id, e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 cursor-pointer"
                  data-testid={`rating-select-${profile.id}`}
                >
                  {RATINGS.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-2">
                  Solo se mostrarán contenidos clasificados como {profile.maxRating} o inferior
                </p>
              </div>

              {/* Genre Restrictions */}
              <div>
                <label className="block text-white font-semibold mb-3">Géneros Permitidos</label>
                <div className="grid grid-cols-2 gap-2">
                  {GENRES.map(genre => (
                    <label key={genre} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.allowedGenres.includes(genre)}
                        onChange={() => handleGenreToggle(profile.id, genre)}
                        className="w-4 h-4 rounded cursor-pointer"
                        data-testid={`genre-${profile.id}-${genre}`}
                      />
                      <span className="text-gray-300 text-sm">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Summary */}
              <div className="bg-slate-700/50 rounded p-4">
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold">Contenido Permitido:</span> Clasificación máxima {profile.maxRating}, {profile.allowedGenres.length} de {GENRES.length} géneros permitidos
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Global Settings */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Configuración Global</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
              <span className="text-white">
                Requerir PIN para cambiar de perfil
              </span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
              <span className="text-white">
                Mostrar advertencia de contenido antes de reproducir
              </span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded cursor-pointer" />
              <span className="text-white">
                Registrar historial de intentos de acceso bloqueados
              </span>
            </label>
          </div>

          <Button className="mt-6 bg-red-600 hover:bg-red-700 w-full">
            Guardar Configuración Global
          </Button>
        </div>
      </div>
    </div>
  );
}
