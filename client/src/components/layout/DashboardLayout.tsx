import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  LogOut, 
  Radio,
  Search,
  Bell,
  Key,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Film, label: "Movies", href: "/movies" },
    { icon: Tv, label: "Series", href: "/series" },
    { icon: Radio, label: "Channels", href: "/channels" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Key, label: "API Keys", href: "/api-keys" },
    { icon: Database, label: "Migration", href: "/migration" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 backdrop-blur-xl">
      <div className="p-6 flex items-center gap-3 mb-4">
        {/* Fenix Logo */}
        <div className="relative w-8 h-8 shrink-0">
           <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary w-full h-full">
              <path d="M20.2 6.00001C18.8 3.80001 16.4 2.20001 13.6 2.00001C13.6 2.00001 16.2 5.00001 15.2 8.00001C15.2 8.00001 12.2 5.60001 9.2 6.60001C9.2 6.60001 11.2 9.00001 9.8 11.2C9.8 11.2 7 9.40001 5 10.6C5 10.6 7.4 12.2 7.2 14.8C7.2 14.8 4.4 14 3 15.6C3 15.6 6 17 7.2 19.4C7.2 19.4 5.4 21.2 6.4 22.8C6.4 22.8 9.4 20.8 12 20.8C15.6 20.8 18.8 18.4 19.8 15C20.8 11.6 20.2 6.00001 20.2 6.00001Z" fill="currentColor"/>
            </svg>
        </div>
        <div className="text-white font-bold text-2xl tracking-wide">
          Fenix
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
                    : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
                )} data-testid={`nav-${item.label.toLowerCase()}`}>
                  <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <div className="bg-card/50 rounded-xl p-4 mb-4 border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-white">System Healthy</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Server Load: 12%
            <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
              <div className="h-full w-[12%] bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
        <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 group">
          <LogOut className="w-5 h-5 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function Topbar() {
  return (
    <div className="h-16 border-b border-white/5 bg-background/50 backdrop-blur-md fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-8">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Global search..." 
          className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 h-9 transition-all"
        />
      </div>
      
      <div className="flex items-center gap-4">
        <Button size="icon" variant="ghost" className="relative text-muted-foreground hover:text-white hover:bg-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
        </Button>
        <div className="h-8 w-[1px] bg-white/10 mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-white">Admin User</div>
            <div className="text-xs text-muted-foreground">Super Administrator</div>
          </div>
          <Avatar className="h-9 w-9 border border-white/10 cursor-pointer hover:ring-2 ring-primary ring-offset-2 ring-offset-background transition-all">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="pl-64 pt-16">
        <div className="container mx-auto p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
