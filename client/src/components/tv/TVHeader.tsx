import { User } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface TVHeaderProps {
  isFocused?: boolean;
}

export function TVHeader({ isFocused = false }: TVHeaderProps) {
  const [, setLocation] = useLocation();

  const handleProfileClick = () => {
    // Check if user is logged in
    const token = localStorage.getItem('appToken');
    
    if (!token) {
      // Not logged in - go to Authentication Gate
      setLocation('/login');
    } else {
      // Logged in - go to profile selection
      setLocation('/tv/profiles');
    }
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent px-8 py-4 flex items-center justify-between",
      "border-b border-red-900/20 transition-all duration-200",
      isFocused && "shadow-lg shadow-red-900/30"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <h1 className="text-2xl font-bold text-white">FENIX</h1>
      </div>

      {/* Right side: User Profile */}
      <div className="flex items-center gap-8">
        {/* User Profile Button - Navigate to Profile Management */}
        <button 
          onClick={handleProfileClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors group cursor-pointer"
          data-testid="button-profile-icon"
          aria-label="Ir a perfil"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm text-white group-hover:text-red-400 transition-colors">Perfil</span>
        </button>
      </div>
    </div>
  );
}
