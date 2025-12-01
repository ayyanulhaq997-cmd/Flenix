import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CreditCard, Download, TrendingUp } from 'lucide-react';
import axios from 'axios';

interface Transaction {
  id: number;
  userId: number;
  planId: number;
  planName: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

interface BillingStats {
  totalRevenue: number;
  totalTransactions: number;
  monthlyRecurring: number;
  conversionRate: number;
}

export default function AdminBilling() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: async () => {
      const { data } = await axios.get('/api/admin/transactions');
      return data;
    },
  });

  // Calculate stats
  const stats: BillingStats = {
    totalRevenue: transactions.reduce((sum, t: Transaction) => sum + (t.status === 'paid' ? t.amount : 0), 0),
    totalTransactions: transactions.length,
    monthlyRecurring: transactions.filter((t: Transaction) => t.status === 'paid').length * 9.99,
    conversionRate: transactions.length > 0 ? (transactions.filter((t: Transaction) => t.status === 'paid').length / transactions.length * 100).toFixed(1) : 0,
  };

  const downloadReport = () => {
    const csv = [
      ['Date', 'Plan', 'Amount', 'Status', 'Method', 'Transaction ID'],
      ...transactions.map((t: Transaction) => [
        new Date(t.createdAt).toLocaleDateString('es-ES'),
        t.planName,
        `$${t.amount}`,
        t.status,
        t.paymentMethod,
        t.transactionId,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Facturación & Pagos</h1>
            <p className="text-gray-400">Sistema de gestión de ingresos y transacciones</p>
          </div>
          <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={downloadReport}>
            <Download size={18} />
            Descargar Reporte
          </Button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Ingresos Totales</p>
              <CreditCard size={24} className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-green-400 text-sm mt-2">↑ {stats.conversionRate}% conversión</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Transacciones</p>
            <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
            <p className="text-gray-400 text-sm mt-2">{transactions.filter((t: Transaction) => t.status === 'paid').length} exitosas</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">MRR (Ingresos Recurrentes)</p>
            <p className="text-3xl font-bold text-white">${stats.monthlyRecurring.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-2">Mensual</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Tasa de Conversión</p>
              <TrendingUp size={24} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.conversionRate}%</p>
            <p className="text-blue-400 text-sm mt-2">De pruebas a pagadas</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-white">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Usuario ID</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Monto</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Método</th>
                <th className="px-6 py-3">ID Transacción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transactions.map((transaction: Transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-700 transition">
                  <td className="px-6 py-3 text-gray-300 text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-3 text-gray-300">{transaction.userId}</td>
                  <td className="px-6 py-3 font-semibold">{transaction.planName}</td>
                  <td className="px-6 py-3 font-semibold">${transaction.amount.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      transaction.status === 'paid'
                        ? 'bg-green-600/20 text-green-400'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {transaction.status === 'paid' ? 'Pagado' : transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-300 text-sm">{transaction.paymentMethod}</td>
                  <td className="px-6 py-3 text-gray-300 text-xs font-mono">{transaction.transactionId.substring(0, 12)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No hay transacciones registradas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
