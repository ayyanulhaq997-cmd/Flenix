import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  LogOut, 
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Film, label: "Movies", href: "/movies" },
    { icon: Tv, label: "Series", href: "/series" },
    { icon: Radio, label: "Channels", href: "/channels" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-2">
        <div className="text-primary font-display text-4xl tracking-wide">STREAM<span className="text-white">ADMIN</span></div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )} data-testid={`nav-${item.label.toLowerCase()}`}>
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-muted-foreground hover:text-white transition-colors rounded-md hover:bg-sidebar-accent">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
