import { Layout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Film, Tv, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function MyWatchlist() {
  const { data: watchlist = [], isLoading, refetch } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const response = await fetch('/api/watchlist');
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      return response.json();
    },
  });

  const handleRemove = async (contentId: number, contentType: string) => {
    try {
      const response = await fetch(`/api/watchlist/${contentId}/${contentType}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Removed from watchlist');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">Watch later - your saved content collection.</p>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] bg-white/5" />
              ))}
            </div>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Your Watchlist is Empty</h3>
            <p className="text-muted-foreground">
              Add movies and series to watch later from the Movies and Series pages.
            </p>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlist.map((item: any) => (
              <div key={`${item.contentType}-${item.contentId}`} className="group relative flex flex-col gap-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/20">
                  {item.content?.posterUrl ? (
                    <img 
                      src={item.content.posterUrl} 
                      alt={item.content.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-muted/20">
                      {item.contentType === 'movie' ? (
                        <Film className="w-12 h-12 text-muted-foreground" />
                      ) : (
                        <Tv className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <div className="text-right">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(item.contentId, item.contentType)}
                        data-testid={`button-remove-watchlist-${item.contentId}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <p className="text-xs text-white/80">
                        {item.watchedPercentage}% watched
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-white leading-none truncate" data-testid={`text-title-${item.contentId}`}>
                    {item.content?.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.contentType === 'movie' ? 'Movie' : 'Series'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
