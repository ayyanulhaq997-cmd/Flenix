import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Plus } from 'lucide-react';
import axios from 'axios';

interface ContentItem {
  id: number;
  title: string;
  status: string;
  requiredPlan: string;
  duration?: number;
  genre?: string;
}

export default function AdminContentList() {
  const token = localStorage.getItem('authToken');
  const [activeTab, setActiveTab] = useState('movies');

  // Fetch movies
  const { data: movies = [], refetch: refetchMovies } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => {
      const { data } = await axios.get('/api/movies', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  // Fetch series
  const { data: series = [], refetch: refetchSeries } = useQuery({
    queryKey: ['admin-series'],
    queryFn: async () => {
      const { data } = await axios.get('/api/series', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  // Fetch channels
  const { data: channels = [], refetch: refetchChannels } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: async () => {
      const { data } = await axios.get('/api/channels', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  const handleDelete = async (type: string, id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/${type}/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (type === 'movies') refetchMovies();
        else if (type === 'series') refetchSeries();
        else if (type === 'channels') refetchChannels();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const renderContentTable = (items: ContentItem[], type: string) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left px-4 py-3 text-gray-400 font-semibold">Title</th>
            <th className="text-left px-4 py-3 text-gray-400 font-semibold">Status</th>
            <th className="text-left px-4 py-3 text-gray-400 font-semibold">Plan</th>
            <th className="text-right px-4 py-3 text-gray-400 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">
                No {type} found
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{item.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    item.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{item.requiredPlan}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors" data-testid={`button-edit-${item.id}`}>
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(type, item.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavigation />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Content Management</h1>
            <p className="text-gray-400">Manage movies, series, and channels</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors" data-testid="button-add-content">
            <Plus size={20} />
            Add Content
          </button>
        </div>

        {/* Content Tabs */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-gray-800 border-b border-gray-700 rounded-none p-0">
              <TabsTrigger value="movies" className="rounded-none border-b-2 data-[state=active]:border-red-600" data-testid="tab-movies">
                Movies ({movies.length})
              </TabsTrigger>
              <TabsTrigger value="series" className="rounded-none border-b-2 data-[state=active]:border-red-600" data-testid="tab-series">
                Series ({series.length})
              </TabsTrigger>
              <TabsTrigger value="channels" className="rounded-none border-b-2 data-[state=active]:border-red-600" data-testid="tab-channels">
                Channels ({channels.length})
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="movies" className="space-y-4">
                {renderContentTable(movies, 'movies')}
              </TabsContent>
              <TabsContent value="series" className="space-y-4">
                {renderContentTable(series, 'series')}
              </TabsContent>
              <TabsContent value="channels" className="space-y-4">
                {renderContentTable(channels, 'channels')}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
