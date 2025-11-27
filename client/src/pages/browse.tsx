import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, MoreVertical, Play, Star, Share } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Populær",
  "Premium",
  "Nordic Islands",
  "Nordic Originals",
  "Action",
  "Drama",
  "Comedy",
  "Documentaries",
];

export default function Browse() {
  const [activeCategory, setActiveCategory] = useState("Populær");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    ...movies.map((m: any) => ({ ...m, type: 'movie' })),
    ...series.map((s: any) => ({ ...s, type: 'series' })),
    ...channels.map((c: any) => ({ ...c, type: 'channel' })),
  ];

  const featuredContent = allContent[0] || null;

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Categories */}
      <div className={cn(
        "fixed md:static left-0 top-0 w-48 h-screen bg-gradient-to-b from-blue-900/10 to-black border-r border-white/10 overflow-y-auto z-40 transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 space-y-1 pt-6">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded text-sm font-medium transition-all",
                activeCategory === category
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
              data-testid={`category-${category.toLowerCase()}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Channels List */}
        <div className="p-4 border-t border-white/10 mt-6">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Channels</h3>
          <div className="space-y-1">
            {channels.map((channel: any) => (
              <button
                key={channel.id}
                className="w-full text-left px-3 py-2 rounded text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                data-testid={`channel-${channel.id}`}
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
            <Menu className="w-6 h-6" data-testid="button-menu" />
          </button>
          <h1 className="text-lg font-bold">Fenix</h1>
          <button className="p-1">
            <MoreVertical className="w-6 h-6" data-testid="button-options" />
          </button>
        </div>

        {/* Featured Section */}
        {featuredContent && (
          <div className="relative overflow-hidden">
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-black overflow-hidden">
              <div className="absolute inset-0 bg-black/40" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="flex items-end gap-4 mb-6">
                  <div className="flex-1">
                    <div className="inline-block bg-blue-600/80 px-2 py-1 rounded text-xs font-bold mb-3">
                      Featured
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-2" data-testid="text-featured-title">
                      {featuredContent.title || featuredContent.name}
                    </h2>
                    <p className="text-sm md:text-base text-white/80 line-clamp-2">
                      {featuredContent.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold transition-all" data-testid="button-play">
                    <Play className="w-4 h-4 fill-white" />
                    Play
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2 rounded font-semibold transition-all" data-testid="button-info">
                    <Star className="w-4 h-4" />
                    More Info
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2 rounded font-semibold transition-all" data-testid="button-share">
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Category Header */}
        <div className="sticky top-16 md:top-0 z-20 bg-black/80 backdrop-blur border-b border-white/5 px-4 md:px-8 py-4">
          <h2 className="text-2xl font-bold">{activeCategory}</h2>
        </div>

        {/* Content Grid */}
        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allContent.map((item: any, idx: number) => (
              <div key={`${item.type}-${item.id || idx}`} className="group cursor-pointer" data-testid={`card-${item.type}-${item.id || idx}`}>
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 aspect-[3/4] border border-white/10 hover:border-white/30 transition-all hover:scale-105">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-600/20 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                    <Play className="w-12 h-12 text-white/60 group-hover:text-white/100 transition-all" />
                    
                    <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 rounded text-xs font-semibold">
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </div>
                    
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
                
                <div className="mt-3">
                  <h3 className="text-sm font-semibold truncate" data-testid={`text-title-${item.id || idx}`}>
                    {item.title || item.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    {item.type === 'channel' ? 'Live' : item.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed md:hidden inset-0 bg-black/60 z-30"
          onClick={() => setSidebarOpen(false)}
          data-testid="overlay-sidebar"
        />
      )}
    </div>
  );
}
