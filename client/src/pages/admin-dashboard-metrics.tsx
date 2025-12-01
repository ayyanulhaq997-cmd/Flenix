import { useQuery } from '@tanstack/react-query';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Users, Film, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface AppUser {
  id: number;
  plan: string;
  email: string;
}

interface Movie {
  id: number;
  title: string;
}

interface Series {
  id: number;
  title: string;
}

interface Channel {
  id: number;
  name: string;
}

export default function AdminDashboardMetrics() {
  const token = localStorage.getItem('authToken');

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  // Fetch movies
  const { data: movies = [] } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: async () => {
      const { data } = await axios.get('/api/movies', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  // Fetch series
  const { data: series = [] } = useQuery({
    queryKey: ['admin-series'],
    queryFn: async () => {
      const { data } = await axios.get('/api/series', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  // Fetch channels
  const { data: channels = [] } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: async () => {
      const { data } = await axios.get('/api/channels', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return data || [];
    },
  });

  // Calculate metrics
  const totalSubscribedUsers = users.filter((u: AppUser) => u.plan !== 'free').length;
  const totalContentItems = movies.length + series.length + channels.length;
  const activePremiumUsers = users.filter((u: AppUser) => u.plan === 'premium').length;

  const metricCards = [
    {
      title: 'Total Subscribed Users',
      value: totalSubscribedUsers,
      icon: <Users className="w-8 h-8 text-blue-400" />,
      description: 'Users on paid plans',
      color: 'from-blue-900/20 to-blue-800/20',
    },
    {
      title: 'Total Content Items',
      value: totalContentItems,
      icon: <Film className="w-8 h-8 text-purple-400" />,
      description: 'Movies + Series + Channels',
      color: 'from-purple-900/20 to-purple-800/20',
    },
    {
      title: 'Active Premium Users',
      value: activePremiumUsers,
      icon: <TrendingUp className="w-8 h-8 text-green-400" />,
      description: 'Premium tier subscribers',
      color: 'from-green-900/20 to-green-800/20',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavigation />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor platform metrics and activity</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {metricCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${card.color} border border-gray-700 rounded-lg p-6 backdrop-blur hover:border-gray-600 transition-all`}
              data-testid={`metric-${idx}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <h3 className="text-4xl font-bold">{card.value}</h3>
                </div>
                {card.icon}
              </div>
              <p className="text-gray-500 text-xs">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users Breakdown */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">User Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Free Users</span>
                <span className="font-bold">{users.filter((u: AppUser) => u.plan === 'free').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Standard Users</span>
                <span className="font-bold">{users.filter((u: AppUser) => u.plan === 'standard').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Premium Users</span>
                <span className="font-bold text-green-400">{activePremiumUsers}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                <span className="text-gray-400">Total Users</span>
                <span className="font-bold text-lg">{users.length}</span>
              </div>
            </div>
          </div>

          {/* Content Breakdown */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Content Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Movies</span>
                <span className="font-bold">{movies.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Series</span>
                <span className="font-bold">{series.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Channels</span>
                <span className="font-bold">{channels.length}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                <span className="text-gray-400">Total Content</span>
                <span className="font-bold text-lg">{totalContentItems}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
