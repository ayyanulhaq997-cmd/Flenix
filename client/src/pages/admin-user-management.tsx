import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface AppUser {
  id: number;
  name: string;
  email: string;
  plan: string;
  lastLogin?: string;
}

export default function AdminUserManagement() {
  const token = localStorage.getItem('appToken');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');

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

  // Filter users
  const filteredUsers = users.filter((user: AppUser) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const handleResetPassword = (userId: number) => {
    console.log('Reset password for user:', userId);
    // Implementation would send password reset email
  };

  const handleChangePlan = (userId: number, newPlan: string) => {
    console.log('Change plan for user:', userId, 'to:', newPlan);
    // Implementation would update user subscription plan
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavigation />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">User Management</h1>
          <p className="text-gray-400">Manage user accounts and subscriptions</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              data-testid="input-search-users"
            />
          </div>

          {/* Plan Filter */}
          <div className="flex gap-2">
            {['all', 'free', 'standard', 'premium'].map((plan) => (
              <button
                key={plan}
                onClick={() => setFilterPlan(plan)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  filterPlan === plan
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
                data-testid={`filter-${plan}`}
              >
                {plan} ({users.filter((u: AppUser) => plan === 'all' || u.plan === plan).length})
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800">
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">Name</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">Email</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">Plan</th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">Last Login</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: AppUser) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white" data-testid={`user-name-${user.id}`}>{user.name}</td>
                      <td className="px-6 py-4 text-gray-300" data-testid={`user-email-${user.id}`}>{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                          user.plan === 'premium' ? 'bg-green-900/30 text-green-400' :
                          user.plan === 'standard' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-gray-700 text-gray-300'
                        }`} data-testid={`plan-${user.id}`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.lastLogin)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
                          data-testid={`button-reset-${user.id}`}
                        >
                          <RotateCcw size={14} />
                          Reset
                        </button>
                        <button
                          onClick={() => {
                            const newPlan = user.plan === 'premium' ? 'standard' : 'premium';
                            handleChangePlan(user.id, newPlan);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                          data-testid={`button-upgrade-${user.id}`}
                        >
                          <TrendingUp size={14} />
                          {user.plan === 'premium' ? 'Downgrade' : 'Upgrade'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold">{users.length}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Filtered Results</p>
            <p className="text-3xl font-bold">{filteredUsers.length}</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Premium Users</p>
            <p className="text-3xl font-bold text-green-400">{users.filter((u: AppUser) => u.plan === 'premium').length}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
