import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface AppUser {
  id: number;
  email: string;
  role: string;
  subscriptionPlan: string;
  createdAt: string;
  lastActive?: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  maxStreams: number;
  maxQuality: string;
  features: string[];
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [showPlanEditor, setShowPlanEditor] = useState(false);

  // Fetch Users
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await axios.get('/api/users');
      return data;
    },
  });

  // Fetch Subscription Plans
  const { data: plans = [], refetch: refetchPlans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data } = await axios.get('/api/subscription-plans');
      return data;
    },
  });

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        refetchUsers();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleChangePlan = async (userId: number, planId: number) => {
    try {
      await axios.put(`/api/users/${userId}`, { subscriptionPlanId: planId });
      refetchUsers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestión de Usuarios</h1>
            <p className="text-gray-400">Administra usuarios y planes de suscripción</p>
          </div>
          <Button className="gap-2 bg-red-600 hover:bg-red-700">
            <Plus size={18} />
            Nuevo Usuario
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden mb-8">
          <table className="w-full text-left text-white">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Creado</th>
                <th className="px-6 py-3">Último Acceso</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user: AppUser) => (
                <tr key={user.id} className="hover:bg-slate-700 transition">
                  <td className="px-6 py-3 font-semibold">{user.email}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.role === 'admin'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={user.subscriptionPlan}
                      onChange={(e) => handleChangePlan(user.id, parseInt(e.target.value))}
                      className="bg-slate-700 text-white rounded px-2 py-1 text-sm cursor-pointer"
                      data-testid={`plan-select-${user.id}`}
                    >
                      {plans.map((plan: SubscriptionPlan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-gray-300 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-3 text-gray-300 text-sm">
                    {user.lastActive ? new Date(user.lastActive).toLocaleDateString('es-ES') : 'Nunca'}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="p-2 hover:bg-slate-600 rounded transition" data-testid={`edit-user-${user.id}`}>
                      <Edit2 size={16} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 hover:bg-slate-600 rounded transition"
                      data-testid={`delete-user-${user.id}`}
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subscription Plans */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Planes de Suscripción</h2>
            <Button className="gap-2 bg-red-600 hover:bg-red-700">
              <Plus size={18} />
              Nuevo Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan: SubscriptionPlan) => (
              <div key={plan.id} className="bg-slate-800 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-2xl font-bold text-red-500 mt-2">${plan.price}</p>
                  </div>
                  <button className="p-2 hover:bg-slate-700 rounded transition">
                    <Edit2 size={16} className="text-blue-400" />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold">Transmisiones simultáneas:</span> {plan.maxStreams}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-semibold">Calidad máxima:</span> {plan.maxQuality}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-white font-semibold text-sm">Características:</p>
                  <ul className="space-y-1">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full mt-6 bg-slate-700 hover:bg-slate-600" data-testid={`edit-plan-${plan.id}`}>
                  Editar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
