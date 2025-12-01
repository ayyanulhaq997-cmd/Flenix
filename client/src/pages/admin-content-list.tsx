import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const token = localStorage.getItem('appToken');
  const [activeTab, setActiveTab] = useState('movies');
  const [openModal, setOpenModal] = useState(false);
  const [contentType, setContentType] = useState('movie');
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Drama',
    year: new Date().getFullYear(),
    description: '',
    status: 'active',
    requiredPlan: 'free',
    posterUrl: '',
    videoUrl: '',
    duration: 120,
    totalSeasons: 1,
    rating: 'TV-14',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (contentType === 'movie') {
        await axios.post('/api/movies', {
          title: formData.title,
          genre: formData.genre,
          year: parseInt(formData.year.toString()),
          description: formData.description,
          status: formData.status,
          requiredPlan: formData.requiredPlan,
          posterUrl: formData.posterUrl,
          videoUrl: formData.videoUrl,
          duration: parseInt(formData.duration.toString()),
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        refetchMovies();
      } else if (contentType === 'series') {
        await axios.post('/api/series', {
          title: formData.title,
          genre: formData.genre,
          totalSeasons: parseInt(formData.totalSeasons.toString()),
          description: formData.description,
          status: formData.status,
          requiredPlan: formData.requiredPlan,
          posterUrl: formData.posterUrl,
          rating: formData.rating,
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        refetchSeries();
      } else if (contentType === 'channel') {
        await axios.post('/api/channels', {
          name: formData.title,
          category: formData.genre,
          status: formData.status === 'active' ? 'online' : 'offline',
          streamUrl: formData.videoUrl,
          logoUrl: formData.posterUrl,
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        refetchChannels();
      }

      setOpenModal(false);
      setFormData({
        title: '',
        genre: 'Drama',
        year: new Date().getFullYear(),
        description: '',
        status: 'active',
        requiredPlan: 'free',
        posterUrl: '',
        videoUrl: '',
        duration: 120,
        totalSeasons: 1,
        rating: 'TV-14',
      });
      alert('Content added successfully!');
    } catch (error: any) {
      alert('Error adding content: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
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
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors" data-testid="button-add-content">
                <Plus size={20} />
                Add Content
              </button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border border-gray-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Content</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddContent} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Content Type</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="movie">Movie</SelectItem>
                      <SelectItem value="series">Series</SelectItem>
                      <SelectItem value="channel">Channel (Live TV)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Movie/Series/Channel name"
                    className="bg-gray-800 border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Genre / Category</label>
                  <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="Drama">Drama</SelectItem>
                      <SelectItem value="Action">Action</SelectItem>
                      <SelectItem value="Comedy">Comedy</SelectItem>
                      <SelectItem value="Thriller">Thriller</SelectItem>
                      <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                      <SelectItem value="Adventure">Adventure</SelectItem>
                      <SelectItem value="Animation">Animation</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="News">News</SelectItem>
                      <SelectItem value="Kids">Kids</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {contentType === 'movie' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Year</label>
                        <Input
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                          className="bg-gray-800 border-gray-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Duration (min)</label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                          className="bg-gray-800 border-gray-600"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {contentType === 'series' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Total Seasons</label>
                    <Input
                      type="number"
                      value={formData.totalSeasons}
                      onChange={(e) => setFormData({ ...formData, totalSeasons: parseInt(e.target.value) })}
                      className="bg-gray-800 border-gray-600"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Content description"
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Required Plan</label>
                    <Select value={formData.requiredPlan} onValueChange={(v) => setFormData({ ...formData, requiredPlan: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Status</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Poster URL</label>
                  <Input
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="Image URL"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {contentType === 'channel' ? 'Stream URL' : 'Video URL'}
                  </label>
                  <Input
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube or video URL"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Content'}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
