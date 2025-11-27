import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, ArrowLeft, MoreVertical, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All Content",
  "Premium",
  "Nordic Islands",
  "Nordic Originals",
  "Action",
  "Drama",
  "Comedy",
  "Documentaries",
  "Thriller",
  "Romance",
];

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("All Content");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const { data: movies = [] } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Failed to fetch movies');
      return response.json();
    },
  });

  const { data: series = [] } = useQuery({
    queryKey: ['series'],
    queryFn: async () => {
      const response = await fetch('/api/series');
      if (!response.ok) throw new Error('Failed to fetch series');
      return response.json();
    },
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await fetch('/api/channels');
      if (!response.ok) throw new Error('Failed to fetch channels');
      return response.json();
    },
  });

  const allContent = [
    ...movies.map(m => ({ ...m, type: 'movie' })),
    ...series.map(s => ({ ...s, type: 'series' })),
    ...channels.map(c => ({ ...c, type: 'channel' })),
  ];

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center justify-between md:hidden">
        <button onClick={() => setSidebarOpen(false)} className="p-1">
          <ArrowLeft className="w-6 h-6 text-white" data-testid="button-back" />
        </button>
        <h1 className="text-white font-bold">Fenix</h1>
        <button className="p-1">
          <MoreVertical className="w-6 h-6 text-white" data-testid="button-menu" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "absolute md:static w-64 h-[calc(100vh-64px)] md:h-screen bg-gradient-to-b from-blue-900/20 to-black border-r border-white/5 overflow-y-auto z-30 transition-transform md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 md:p-4 space-y-4">
            <div className="hidden md:block">
              <div className="flex items-center gap-2 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20.2 6.00001C18.8 3.80001 16.4 2.20001 13.6 2.00001C13.6 2.00001 16.2 5.00001 15.2 8.00001C15.2 8.00001 12.2 5.60001 9.2 6.60001C9.2 6.60001 11.2 9.00001 9.8 11.2C9.8 11.2 7 9.40001 5 10.6C5 10.6 7.4 12.2 7.2 14.8C7.2 14.8 4.4 14 3 15.6C3 15.6 6 17 7.2 19.4C7.2 19.4 5.4 21.2 6.4 22.8C6.4 22.8 9.4 20.8 12 20.8C15.6 20.8 18.8 18.4 19.8 15C20.8 11.6 20.2 6.00001 20.2 6.00001Z" fill="white"/>
                </svg>
                <span className="text-white font-bold text-lg">Fenix</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    activeCategory === category
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                  data-testid={`category-${category.toLowerCase()}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Desktop Header */}
          <div className="hidden md:flex sticky top-0 z-20 items-center justify-between bg-black/50 backdrop-blur border-b border-white/5 px-8 py-4">
            <h2 className="text-2xl font-bold text-white">{activeCategory}</h2>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors" data-testid="button-favorites">
                <Heart className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors" data-testid="button-search">
                <Menu className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allContent.map((item: any, idx: number) => (
                <div key={`${item.type}-${item.id || idx}`} className="group cursor-pointer" data-testid={`card-${item.type}-${item.id || idx}`}>
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 aspect-[3/4] border border-white/10 hover:border-white/30 transition-all">
                    {/* Placeholder for poster */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-600/20 flex items-center justify-center relative group">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                      <Play className="w-12 h-12 text-white/60 group-hover:text-white/100 transition-all" />
                      
                      {/* Genre/Type badge */}
                      <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 rounded text-xs font-semibold text-white">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </div>
                      
                      {/* Favorite button */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id || idx);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                        data-testid={`button-favorite-${item.id || idx}`}
                      >
                        <Heart className={cn(
                          "w-4 h-4 transition-colors",
                          favorites.includes(item.id || idx) ? "fill-red-500 text-red-500" : "text-white/60"
                        )} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    <h3 className="text-sm font-semibold text-white truncate" data-testid={`text-title-${item.id || idx}`}>
                      {item.title || item.name}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2">
                      {item.description || `${item.type} content`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed md:hidden bottom-6 left-6 p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-all z-20"
        data-testid="button-mobile-menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed md:hidden inset-0 bg-black/60 z-20"
          onClick={() => setSidebarOpen(false)}
          data-testid="overlay-sidebar"
        />
      )}
    </div>
  );
}
