import { useLocation } from 'wouter';
import { LayoutDashboard, FileText, Users, LogOut, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function AdminNavigation() {
  const [location, setLocation] = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Content', href: '/admin/content', icon: <FileText size={20} /> },
    { label: 'Users', href: '/admin/users', icon: <Users size={20} /> },
    { label: 'Billing', href: '/admin/billing', icon: <CreditCard size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('appToken');
    localStorage.removeItem('appUser');
    setLocation('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-black border-r border-red-900/20 p-6 flex flex-col shadow-lg">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Fenix</h1>
          <p className="text-xs text-gray-400">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => setLocation(item.href)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-semibold',
              location === item.href
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-red-400'
            )}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 font-semibold"
        data-testid="button-logout"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}
