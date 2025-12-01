import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';
import AdminBatchImport from './admin-batch-import';
import AdminUsers from './admin-users';
import AdminParentalControls from './admin-parental-controls';
import AdminBilling from './admin-billing';

interface Movie {
  id: number;
  title: string;
  year?: number;
  duration?: number;
  status: string;
  requiredPlan: string;
}

interface Series {
  id: number;
  title: string;
  year?: number;
  status: string;
}

interface Channel {
  id: number;
  title: string;
  status: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('movies');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch Movies
  const { data: movies = [], isLoading: moviesLoading, refetch: refetchMovies } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => {
      const { data } = await axios.get('/api/movies');
      return data;
    },
  });

  // Fetch Series
  const { data: series = [], refetch: refetchSeries } = useQuery({
    queryKey: ['admin-series'],
    queryFn: async () => {
      const { data } = await axios.get('/api/series');
      return data;
    },
  });

  // Fetch Channels
  const { data: channels = [], refetch: refetchChannels } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: async () => {
      const { data } = await axios.get('/api/channels');
      return data;
    },
  });

  const handleDelete = async (type: string, id: number) => {
    if (window.confirm('¿Está seguro de eliminar este elemento?')) {
      try {
        await axios.delete(`/api/${type}/${id}`);
        if (type === 'movies') refetchMovies();
        else if (type === 'series') refetchSeries();
        else if (type === 'channels') refetchChannels();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage content, users, and subscriptions</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-12 bg-slate-800 overflow-x-auto">
            <TabsTrigger value="movies" className="text-white">PELÍCULAS</TabsTrigger>
            <TabsTrigger value="series" className="text-white">SERIES</TabsTrigger>
            <TabsTrigger value="videos" className="text-white">VIDEOS</TabsTrigger>
            <TabsTrigger value="drama" className="text-white">DRAMA</TabsTrigger>
            <TabsTrigger value="songs" className="text-white">CANCIONES</TabsTrigger>
            <TabsTrigger value="naat" className="text-white">NAAT</TabsTrigger>
            <TabsTrigger value="cartoon" className="text-white">DIBUJOS</TabsTrigger>
            <TabsTrigger value="channels" className="text-white">CANALES</TabsTrigger>
            <TabsTrigger value="import" className="text-white">IMPORTAR</TabsTrigger>
            <TabsTrigger value="export" className="text-white">EXPORTAR</TabsTrigger>
            <TabsTrigger value="api-keys" className="text-white">API KEYS</TabsTrigger>
            <TabsTrigger value="billing" className="text-white">FACTURACIÓN</TabsTrigger>
          </TabsList>

          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Películas</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nueva Película
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-white">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Año</th>
                    <th className="px-6 py-3">Duración</th>
                    <th className="px-6 py-3">Plan Requerido</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {movies.map((movie: Movie) => (
                    <tr key={movie.id} className="hover:bg-slate-700 transition">
                      <td className="px-6 py-3 text-gray-300">{movie.id}</td>
                      <td className="px-6 py-3 font-semibold">{movie.title}</td>
                      <td className="px-6 py-3 text-gray-300">{movie.year || 'N/A'}</td>
                      <td className="px-6 py-3 text-gray-300">{movie.duration || 'N/A'} min</td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                          {movie.requiredPlan || 'free'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          movie.status === 'published' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {movie.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <button className="p-2 hover:bg-slate-600 rounded transition" data-testid={`edit-movie-${movie.id}`}>
                          <Edit2 size={16} className="text-blue-400" />
                        </button>
                        <button 
                          onClick={() => handleDelete('movies', movie.id)}
                          className="p-2 hover:bg-slate-600 rounded transition"
                          data-testid={`delete-movie-${movie.id}`}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Series Tab */}
          <TabsContent value="series" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Series</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nueva Serie
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-white">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Año</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {series.map((s: Series) => (
                    <tr key={s.id} className="hover:bg-slate-700 transition">
                      <td className="px-6 py-3 text-gray-300">{s.id}</td>
                      <td className="px-6 py-3 font-semibold">{s.title}</td>
                      <td className="px-6 py-3 text-gray-300">{s.year || 'N/A'}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          s.status === 'published' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <button className="p-2 hover:bg-slate-600 rounded transition" data-testid={`edit-series-${s.id}`}>
                          <Edit2 size={16} className="text-blue-400" />
                        </button>
                        <button 
                          onClick={() => handleDelete('series', s.id)}
                          className="p-2 hover:bg-slate-600 rounded transition"
                          data-testid={`delete-series-${s.id}`}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Videos</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nuevo Video
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
              <p>Gesiona videos cortos, tutorials y contenido de usuario</p>
            </div>
          </TabsContent>

          {/* Drama Tab */}
          <TabsContent value="drama" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Drama</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nuevo Drama
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
              <p>Gesiona series de drama, programas especiales y miniseries</p>
            </div>
          </TabsContent>

          {/* Songs Tab */}
          <TabsContent value="songs" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Canciones</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nueva Canción
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
              <p>Gesiona música, videoclips y contenido musical</p>
            </div>
          </TabsContent>

          {/* Naat Tab */}
          <TabsContent value="naat" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Naat</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nuevo Naat
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
              <p>Gesiona naats islámicos y contenido religioso</p>
            </div>
          </TabsContent>

          {/* Cartoon Tab */}
          <TabsContent value="cartoon" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Dibujos Animados</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nuevo Dibujo
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400">
              <p>Gesiona series de dibujos animados y contenido infantil</p>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Canales</h2>
              <Button className="gap-2 bg-red-600 hover:bg-red-700">
                <Plus size={18} />
                Nuevo Canal
              </Button>
            </div>
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-white">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {channels.map((c: Channel) => (
                    <tr key={c.id} className="hover:bg-slate-700 transition">
                      <td className="px-6 py-3 text-gray-300">{c.id}</td>
                      <td className="px-6 py-3 font-semibold">{c.title}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          c.status === 'active' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 flex gap-2">
                        <button className="p-2 hover:bg-slate-600 rounded transition" data-testid={`edit-channel-${c.id}`}>
                          <Edit2 size={16} className="text-blue-400" />
                        </button>
                        <button 
                          onClick={() => handleDelete('channels', c.id)}
                          className="p-2 hover:bg-slate-600 rounded transition"
                          data-testid={`delete-channel-${c.id}`}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="mt-6">
            <AdminBatchImport />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6 mt-6">
            <div className="bg-slate-800 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Exportar Datos</h2>
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-2">Exportar Películas</h3>
                  <p className="text-gray-400 mb-4">Descargue todos los metadatos de películas en formato JSON</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">Descargar Películas</Button>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-2">Exportar Series</h3>
                  <p className="text-gray-400 mb-4">Descargue todos los metadatos de series en formato JSON</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">Descargar Series</Button>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <h3 className="text-lg font-semibold text-white mb-2">Transferencia de Datos</h3>
                  <p className="text-gray-400 mb-4">Transfiera datos a otro servidor o servicio de almacenamiento</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">Iniciar Transferencia</Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6 mt-6">
            <div className="bg-slate-800 rounded-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Claves API</h2>
                <Button className="gap-2 bg-red-600 hover:bg-red-700">
                  <Plus size={18} />
                  Generar Nueva Clave
                </Button>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Clave API Principal</h3>
                      <p className="text-gray-400 text-sm mt-1">sk_live_abc123xyz...</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400/10">
                      Revocar
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs">Creada: 2024-12-01</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Clave API de Desarrollo</h3>
                      <p className="text-gray-400 text-sm mt-1">sk_test_def456uvw...</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400/10">
                      Revocar
                    </Button>
                  </div>
                  <p className="text-gray-500 text-xs">Creada: 2024-11-15</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <AdminUsers />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="mt-6">
            <AdminBilling />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
